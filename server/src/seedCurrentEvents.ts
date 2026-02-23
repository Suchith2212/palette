import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event, { IEvent } from './models/Event';
import User from './models/User';
import path from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/palette', {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// IST offset in milliseconds (UTC+5:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Helper function to parse a date string like "31 Jan" and combine with current year in IST
const parseShortDateString = (dateStr: string, year: number): Date | null => {
  if (!dateStr || dateStr.trim() === '') return null;

  // Attempt to parse as a local IST date
  const monthDay = dateStr.match(/(\d+)\s*([A-Za-z]+)/); // e.g., "31 Jan"
  let day = 1;
  let month = 0; // January is 0

  if (monthDay) {
    day = parseInt(monthDay[1], 10);
    const monthName = monthDay[2].toLowerCase();
    const monthIndex = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ].indexOf(monthName.substring(0, 3));

    if (monthIndex === -1) return null; // Invalid month
    month = monthIndex;
  } else {
    // Fallback for simple month names or other formats
    const monthNameOnly = dateStr.match(/([A-Za-z]+)/);
    if (monthNameOnly) {
      const monthIndex = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ].indexOf(monthNameOnly[1].toLowerCase());
      if (monthIndex !== -1) month = monthIndex;
      else return null;
    } else {
      return null;
    }
  }

  // Create a Date object representing the start of the day in IST
  // We cannot directly create an IST date without a specific timezone environment.
  // Instead, create a UTC date and then adjust to represent IST.
  // Date.UTC(year, month, day) creates a UTC date
  const d = new Date(Date.UTC(year, month, day, 0, 0, 0)); // Start of day in UTC

  // To represent the start of the day in IST, this UTC date needs to be adjusted by the offset
  // E.g., 2026-02-01 00:00:00 IST is 2026-01-31 18:30:00 UTC
  // So, to get 2026-02-01 00:00:00 IST's UTC equivalent, we subtract the offset from the UTC date
  // This essentially makes 'd' store the UTC equivalent of 00:00:00 IST for that date
  return new Date(d.getTime() - IST_OFFSET_MS); 
};

// Helper function to parse time string like "4:00 PM"
const parseTime = (timeStr: string): { hours: number; minutes: number } | null => {
  const timeMatch = timeStr.match(/(\d+)(:\d+)?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2].substring(1), 10) : 0;
    const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : '';

    if (ampm === 'pm' && hours < 12) {
      hours += 12;
    }
    if (ampm === 'am' && hours === 12) { // 12 AM is 0 hours
      hours = 0;
    }
    return { hours, minutes };
  }
  return null;
};

const importData = async () => {
  await connectDB();

  try {
    // Find an admin user to assign as 'createdBy'
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    console.log(`Found admin user: ${adminUser.iitgEmail || adminUser._id}\n`);

    const currentYear = 2026; // Explicitly set to current year of the environment
    const now = new Date();
    const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Read present_events.json
    const jsonPath = path.join(__dirname, '..', '..', 'client', 'src', 'components', 'present_events.json');
    const rawData = readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    const eventsToImport = data.events.map((event: any, index: number) => {
      let startDate: Date | null = null;
      let endDate: Date | undefined = undefined; // Initialize endDate as undefined

      // Parse date and time
      startDate = parseShortDateString(event.date, currentYear);
      if (!startDate) {
        console.warn(`Skipping event "${event.title}" due to unparsable date string: ${event.date}`);
        return null;
      }

      const timeString = event.time;
      if (timeString && timeString.trim() !== '') {
        const timeParts = timeString.split(' – '); // Note the en dash here
        const startTimeParsed = parseTime(timeParts[0]);

        if (startTimeParsed) {
          startDate.setUTCHours(startTimeParsed.hours);
          startDate.setUTCMinutes(startTimeParsed.minutes);
        }

        if (timeParts.length > 1) { // If there's an end time
          endDate = new Date(startDate.getTime()); // Initialize endDate with startDate
          const endTimeParsed = parseTime(timeParts[1]);
          if (endTimeParsed) {
            endDate.setUTCHours(endTimeParsed.hours);
            endDate.setUTCMinutes(endTimeParsed.minutes);
            // Handle case where end time is on the next day (e.g., 10 PM - 2 AM IST)
            // If the adjusted endDate is before startDate (meaning it rolled over midnight IST),
            // then add one day to the UTC date, considering IST day rollovers.
            // A simpler way: if the UTC date after setting time is earlier than the original startDate UTC, add a day.
            if (endDate.getTime() < startDate.getTime() && startTimeParsed && endTimeParsed.hours < startTimeParsed.hours) {
                endDate.setUTCDate(endDate.getUTCDate() + 1);
            }
          }
        }
      }

      // Final validation after parsing
      if (isNaN(startDate.getTime())) {
        console.warn(`Skipping event "${event.title}" due to invalid parsed start date: ${event.date}`);
        return null;
      }
      if (endDate && isNaN(endDate.getTime())) {
        console.warn(`Skipping event "${event.title}" due to invalid parsed end date.`);
        endDate = undefined; // Discard invalid end date
      }
      
      // Determine event status: upcoming or completed
      let status: 'upcoming' | 'completed' = 'upcoming';
      if (endDate && endDate < startOfTodayUTC ) { // If event has an end date and it's before start of today
        status = 'completed';
      } else if (!endDate && startDate < startOfTodayUTC) { // If no end date and start date is before start of today
        status = 'completed';
      } else  {
        status = 'upcoming';
      } 

      // Infer event type if possible from title/description, otherwise default to 'event'
      let type: 'workshop' | 'competition' | 'event' = 'event';
      const lowerTitle = event.title.toLowerCase();
      if (lowerTitle.includes('workshop')) {
        type = 'workshop';
      } else if (lowerTitle.includes('quiz') || lowerTitle.includes('competition')) {
        type = 'competition';
      }
      // If the event is in the past, categorize it accordingly
      // (This logic might need refinement if 'past events' have specific types)

      return {
        title: event.title,
        description: event.description,
        date: startDate,
        endDate: endDate,
        location: event.venue, // Assuming venue is location
        type: type,
        imageUrl: `/uploads/exhibition/ev_${index + 23}.jpeg`, // Corrected image path as per user
        maxParticipants: undefined,
        createdBy: adminUser._id,
        status: status,
      };
    }).filter(Boolean); // Filter out any null entries due to invalid dates

    // Do not clear all existing events, as this script is meant to add current events alongside past events.
    // Events are dynamically marked as upcoming or completed, and getPastEvents/getUpcomingEvents
    // handles their display.
    console.log('Inserting current events...');
    console.log(`Import summary:`);
    console.log(`  Total: ${eventsToImport.length} events`);
    console.log(`  Upcoming: ${eventsToImport.filter((e: IEvent) => e.status === 'upcoming').length}`);
    console.log(`  Completed: ${eventsToImport.filter((e: IEvent) => e.status === 'completed').length}`);
    console.log(`  Workshops: ${eventsToImport.filter((e: IEvent) => e.type === 'workshop').length}`);
    console.log(`  Competitions: ${eventsToImport.filter((e: IEvent) => e.type === 'competition').length}`);
    console.log(`  Events: ${eventsToImport.filter((e: IEvent) => e.type === 'event').length}`);


    await Event.insertMany(eventsToImport);
    console.log('Current events Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
