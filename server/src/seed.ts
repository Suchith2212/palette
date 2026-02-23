import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event';
import User from './models/User'; // Assuming we need a user to assign 'createdBy'
import path from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/palette', {
      // useNewUrlParser: true, // Deprecated in Mongoose 6.0
      // useUnifiedTopology: true, // Deprecated in Mongoose 6.0
      // useCreateIndex: true, // Deprecated in Mongoose 6.0
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Helper function to parse a date string like "2nd August 2025" or "August 2025"
const parseFullDateString = (fullDateStr: string, year: number): Date | null => {
  if (!fullDateStr || fullDateStr.trim() === '') return null;
  // Remove day suffixes (st, nd, rd, th) for simpler parsing by Date constructor
  const cleanedDateStr = fullDateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');
  const d = new Date(`${cleanedDateStr} ${year}`);
  // Validate if the parsed date is actually valid and in the expected year (to prevent parsing "August" as current year)
  if (isNaN(d.getTime()) || d.getFullYear() !== year) {
      // If parsing failed with full string, try parsing as just month if it matches a month name
      const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
      ];
      const monthMatch = cleanedDateStr.match(/([A-Za-z]+)/);
      if (monthMatch) {
          const monthIndex = monthNames.findIndex(m => m.startsWith(monthMatch[1]));
          if (monthIndex !== -1) {
              return new Date(year, monthIndex, 1); // Default to 1st of the month
          }
      }
      return null;
  }
  return d;
};

// Helper function to parse time string like "12:30 pm"
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
    // Clear existing events before importing to avoid duplicates
    await Event.deleteMany();
    console.log('Existing events cleared.');

    // Find an admin user to assign as 'createdBy'
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Read hi.json
    const hiJsonPath = path.join(__dirname, '..', '..', 'client', 'src', 'components', 'past_events.json');
    const rawData = readFileSync(hiJsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    const eventsToImport = data.events.map((event: any, index: number) => { // Added index
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      const year = 2025; // All events are in 2025

      // Handle empty date string for "Combined Art Exhibition"
      if (!event.Date || event.Date.trim() === '') {
        console.warn(`Event "${event.Title}" has no date. Assigning a placeholder date.`);
        startDate = new Date('1970-01-01T00:00:00Z'); // Epoch start, ensures it's in the past
      } else {
        // Step 1: Parse Date(s)
        const dateRangeMatch = event.Date.match(/(.+?)\s*-\s*(.+)/);
        if (dateRangeMatch) {
          // Handle date ranges like "15th August - 20th August" or "August - September"
          const startPart = dateRangeMatch[1].trim();
          const endPart = dateRangeMatch[2].trim();

          startDate = parseFullDateString(startPart, year);
          endDate = parseFullDateString(endPart, year);
          
          // If a start date has a day, and an end date is just a month, try to infer day
          // e.g., "6th August - September"
          if (startDate && endDate && startDate.getDate() !== 1 && endDate.getDate() === 1) {
              // Only if end month is after start month
              if (endDate.getMonth() > startDate.getMonth()) {
                  // If end date is the 1st of month and start date has a specific day,
                  // it's likely a month range where the second date is also end of month or similar.
                  // For now, if we cannot parse day in endPart, assume 1st.
              } else if (endDate.getMonth() === startDate.getMonth()) {
                  // Same month, if start has day and end is 1st (e.g., "6th August - 7th August"),
                  // it means parseFullDateString failed to get the day for endPart.
                  // This case should not happen if parseFullDateString works for "7th August"
              }
          }

        } else {
          // Handle single date like "2nd August"
          startDate = parseFullDateString(event.Date, year);
        }
      } // End of if (!event.Date) else block
      
      // Basic validation for parsed dates
      if (!startDate) {
        console.warn(`Skipping event "${event.Title}" due to unparsable date string: ${event.Date}`);
        return null;
      }

      // Step 2: Parse Time and combine with Date(s)
      const timeString = event.Time;
      if (timeString && timeString !== 'Online' && timeString.trim() !== '') {
        const timeParts = timeString.split(' - ');
        const startTimeParsed = parseTime(timeParts[0]);

        if (startTimeParsed) {
          startDate.setHours(startTimeParsed.hours);
          startDate.setMinutes(startTimeParsed.minutes);
        }

        if (timeParts.length > 1 && endDate) {
          const endTimeParsed = parseTime(timeParts[1]);
          if (endTimeParsed) {
            endDate.setHours(endTimeParsed.hours);
            endDate.setMinutes(endTimeParsed.minutes);
          }
        }
      }

      // Final validation after parsing
      if (isNaN(startDate.getTime())) {
        console.warn(`Skipping event "${event.Title}" due to invalid parsed start date: ${event.Date}`);
        return null;
      }
      if (endDate && isNaN(endDate.getTime())) {
        console.warn(`Skipping event "${event.Title}" due to invalid parsed end date: ${event.Date}`);
        return null;
      }

      // Ensure endDate is not before startDate in case of parsing errors
      if (startDate && endDate && endDate < startDate) {
        console.warn(`Event "${event.Title}" has endDate before startDate. Adjusting endDate to startDate.`);
        endDate = startDate;
      }

      return {
        title: event.Title,
        description: event.Description,
        date: startDate,
        endDate: endDate || undefined, // Use undefined if no endDate
        location: 'IIT Gandhinagar',
        type: event.Classification.toLowerCase(),
        imageUrl: `/uploads/exhibition/ev_${index + 1}.png`, // Dynamic image URL including exhibition subfolder, .png format
        maxParticipants: undefined,
        createdBy: adminUser._id,
        status: 'completed',
      };
    }).filter(Boolean); // Filter out any null entries due to invalid dates

    await Event.insertMany(eventsToImport);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await Event.deleteMany();
    await User.deleteMany({ isAdmin: { $ne: true } }); // Keep admin user, delete others
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
