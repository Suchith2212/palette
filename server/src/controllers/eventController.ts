import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose, { Schema } from 'mongoose';
import Event, { IEvent } from '../models/Event';
import path from 'path';
import { promises as fs } from 'fs';
import sendEmail from '../utils/sendEmail'; // Import sendEmail utility
import User from '../models/User'; // Import User model to get user email
import { logAdminAction } from '../utils/adminAudit';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string | string[] | undefined): boolean => {
  if (!id || Array.isArray(id)) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper to ensure string from params
const getParamId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) return id[0];
  return id || '';
};

// IST offset in milliseconds (UTC+5:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Helper to get the start of the current day in IST, converted back to UTC
const getStartOfUserDayUTC = (utcDate: Date): Date => {
  // 1. Adjust to IST's time by adding offset
  const dateInIST = new Date(utcDate.getTime() + IST_OFFSET_MS);

  // 2. Get the start of THIS DAY in IST (year, month, date of dateInIST)
  // This implicitly uses the local timezone of the 'dateInIST' object, which is effectively IST.
  const startOfISTDay = new Date(dateInIST.getFullYear(), dateInIST.getMonth(), dateInIST.getDate());

  // 3. Convert this start of IST day back to UTC
  // This means subtracting the offset.
  return new Date(startOfISTDay.getTime() - IST_OFFSET_MS);
};

// @desc    Get all upcoming events (workshops, competitions, general events)
// @route   GET /api/events/upcoming?type=workshop OR ?type=competition OR ?type=event
// @access  Public
export const getUpcomingEvents = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;

  const now = new Date();
  const startOfTodayForUser = getStartOfUserDayUTC(now);

  const conditions: any[] = [
    {
      $or: [
        // If an endDate exists, it must be greater than or equal to the start of today (in user's timezone)
        { endDate: { $gte: startOfTodayForUser } },
        // If no endDate, the main date must be greater than or equal to the start of today (in user's timezone)
        { endDate: { $exists: false }, date: { $gte: startOfTodayForUser } }
      ]
    }
  ];

  if (type && typeof type === 'string' && ['workshop', 'competition', 'event'].includes(type)) {
    conditions.push({ type: type });
  }

  const events = await Event.find({ $and: conditions }).sort('date');
  res.json(events);
});

// @desc    Get all upcoming workshops
// @route   GET /api/events/workshops
// @access  Public
export const getUpcomingWorkshops = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const startOfTodayForUser = getStartOfUserDayUTC(now);

  const workshops = await Event.find({ 
    type: 'workshop', 
    $or: [
      { endDate: { $gte: startOfTodayForUser } },
      { endDate: { $exists: false }, date: { $gte: startOfTodayForUser } }
    ]
  }).sort('date');
  
  res.json(workshops);
});

// @desc    Get all upcoming competitions
// @route   GET /api/events/competitions
// @access  Public
export const getUpcomingCompetitions = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const startOfTodayForUser = getStartOfUserDayUTC(now);

  const competitions = await Event.find({ 
    type: 'competition', 
    $or: [
      { endDate: { $gte: startOfTodayForUser } },
      { endDate: { $exists: false }, date: { $gte: startOfTodayForUser } }
    ]
  }).sort('date');
  
  res.json(competitions);
});

// @desc    Get events selected for the homepage loop (admin curated)
// @route   GET /api/events/loop
// @access  Public
export const getLoopEvents = asyncHandler(async (req: Request, res: Response) => {
  const loopEvents = await Event.find({ loopOrder: { $ne: null, $exists: true } }).sort({ loopOrder: 1, date: -1 });
  res.json(loopEvents);
});

// @desc    Get all past events, categorized
// @route   GET /api/events/past
// @access  Public
export const getPastEvents = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const startOfTodayForUser = getStartOfUserDayUTC(now);
  const startOfNextDayForUser = new Date(startOfTodayForUser.getTime());
  startOfNextDayForUser.setUTCDate(startOfTodayForUser.getUTCDate() + 1); // Start of next day in user's timezone (UTC)

  const conditions: any[] = [
    {
      $or: [
        // If an endDate exists, it must be strictly less than the start of the next day (in user's timezone)
        { endDate: { $lt: startOfNextDayForUser } },
        // If no endDate, the main date must be strictly less than the start of the next day (in user's timezone)
        { endDate: { $exists: false }, date: { $lt: startOfNextDayForUser } }
      ]
    }
  ];

  const pastEvents = await Event.find({ $and: conditions }).sort('-date');
  
  res.json(pastEvents);
});

// @desc    Get all events (admin)
// @route   GET /api/events/admin/all
// @access  Private/Admin
export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view all events');
  }

  const events = await Event.find({}).sort('-date');
  res.json(events);
});

// @desc    Batch update loop/archive selections
// @route   PUT /api/events/admin/selections
// @access  Private/Admin
export const updateEventSelections = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update event selections');
  }

  const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
  if (updates.length === 0) {
    res.json({ message: 'No selection changes to save.', updatedEvents: [] });
    return;
  }

  const invalidUpdate = updates.find((update: any) => {
    const loopOrder = update.loopOrder;
    const archiveOrder = update.archiveOrder;
    const invalidLoop = loopOrder !== null && loopOrder !== undefined && (isNaN(Number(loopOrder)) || Number(loopOrder) < 1);
    const invalidArchive = archiveOrder !== null && archiveOrder !== undefined && (isNaN(Number(archiveOrder)) || Number(archiveOrder) < 1);
    return !update?.id || !isValidObjectId(update.id) || invalidLoop || invalidArchive;
  });

  if (invalidUpdate) {
    res.status(400);
    throw new Error('Invalid selection update payload');
  }

  const uniqueIds = Array.from(
    new Set<string>(updates.map((update: { id: string }) => update.id.toString()))
  );
  const events = await Event.find({ _id: { $in: uniqueIds } });
  const eventMap = new Map(events.map((event) => [event._id.toString(), event]));

  if (eventMap.size !== uniqueIds.length) {
    res.status(404);
    throw new Error('One or more events were not found');
  }

  const changedEvents: IEvent[] = [];
  const changeSummaries: string[] = [];

  for (const update of updates) {
    const event = eventMap.get(update.id);
    if (!event) {
      continue;
    }

    const previousLoopOrder = event.loopOrder ?? null;
    const previousArchiveOrder = event.archiveOrder ?? null;
    const nextLoopOrder = update.loopOrder === null || update.loopOrder === undefined ? null : Number(update.loopOrder);
    const nextArchiveOrder = update.archiveOrder === null || update.archiveOrder === undefined ? null : Number(update.archiveOrder);

    if (previousLoopOrder === nextLoopOrder && previousArchiveOrder === nextArchiveOrder) {
      continue;
    }

    const parts: string[] = [];
    if (previousLoopOrder !== nextLoopOrder) {
      if (previousLoopOrder === null && nextLoopOrder !== null) {
        parts.push(`added to the homepage loop at position ${nextLoopOrder}`);
      } else if (previousLoopOrder !== null && nextLoopOrder === null) {
        parts.push('removed from the homepage loop');
      } else {
        parts.push(`moved in the homepage loop from ${previousLoopOrder} to ${nextLoopOrder}`);
      }
    }

    if (previousArchiveOrder !== nextArchiveOrder) {
      if (previousArchiveOrder === null && nextArchiveOrder !== null) {
        parts.push(`added to the archive at position ${nextArchiveOrder}`);
      } else if (previousArchiveOrder !== null && nextArchiveOrder === null) {
        parts.push('removed from the archive');
      } else {
        parts.push(`moved in the archive from ${previousArchiveOrder} to ${nextArchiveOrder}`);
      }
    }

    event.loopOrder = nextLoopOrder;
    event.archiveOrder = nextArchiveOrder;
    await event.save();

    changedEvents.push(event);
    changeSummaries.push(`${event.title}: ${parts.join(', ')}`);
  }

  if (changedEvents.length === 0) {
    res.json({ message: 'No selection changes to save.', updatedEvents: [] });
    return;
  }

  const summary =
    changedEvents.length === 1
      ? changeSummaries[0]
      : `${changedEvents.length} event selections updated`;

  await logAdminAction(
    req,
    'Updated event selections',
    'event',
    null,
    changeSummaries.join('\n'),
    {
      selectionUpdate: true,
      summary,
      changeCount: changeSummaries.length,
      changes: changeSummaries,
    }
  );

  res.json({
    message: 'Selections saved.',
    updatedEvents: changedEvents,
  });
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, date, endDate, location, type, maxParticipants } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to create event');
  }

  if (!title || !description || !date || !location || !type) {
    res.status(400);
    throw new Error('Please enter all required fields: title, description, start date, location, type');
  }

  if (!['workshop', 'competition', 'event'].includes(type)) {
    res.status(400);
    throw new Error('Invalid event type. Must be workshop, competition, or event');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Event image is required');
  }

  // Add validation for image type
  if (req.file.mimetype !== 'image/png') {
    res.status(400);
    throw new Error('Only PNG images are allowed for events.');
  }

  const eventDate = new Date(date);
  if (isNaN(eventDate.getTime())) {
    res.status(400);
    throw new Error('Invalid start date format');
  }

  let eventEndDate;
  if (endDate) {
    eventEndDate = new Date(endDate);
    if (isNaN(eventEndDate.getTime())) {
      res.status(400);
      throw new Error('Invalid end date format');
    }
    if (eventEndDate < eventDate) {
      res.status(400);
      throw new Error('End date cannot be before start date');
    }
  }

  if (maxParticipants && (isNaN(Number(maxParticipants)) || Number(maxParticipants) < 1)) {
    res.status(400);
    throw new Error('Max participants must be a positive number');
  }

  const imageUrl = `/uploads/${req.file!.filename}`;

  const event = new Event({
    title,
    description,
    date: eventDate,
    endDate: eventEndDate,
    location,
    type,
    imageUrl,
    maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
    createdBy: req.user!._id,
  });

  const createdEvent = await event.save();
  await logAdminAction(
    req,
    'Created event',
    'event',
    createdEvent._id.toString(),
    `Created ${createdEvent.type} "${createdEvent.title}"`,
    {
      title: createdEvent.title,
      type: createdEvent.type,
      date: createdEvent.date,
      endDate: createdEvent.endDate,
      location: createdEvent.location,
    }
  );
  res.status(201).json(createdEvent);
});

// @desc    Apply to an event
// @route   POST /api/events/:id/apply
// @access  Private
export const applyToEvent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const eventId = getParamId(req.params.id);
  const userId = req.user._id;

  // Validate ObjectId using mongoose utility
  if (!isValidObjectId(eventId)) {
    res.status(400);
    throw new Error('Invalid event ID format');
  }

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const previousEventState = {
    title: event.title,
    description: event.description,
    date: event.date?.toISOString(),
    location: event.location,
    type: event.type,
    status: event.status,
    archiveOrder: event.archiveOrder,
    loopOrder: event.loopOrder,
  };

  const now = new Date();
  const startOfTodayForUser = getStartOfUserDayUTC(now);

  if (event.endDate ? event.endDate < startOfTodayForUser : event.date < startOfTodayForUser) {
    res.status(400);
    throw new Error('Cannot apply to a past event');
  }

  // Better check for existing registration
  const isAlreadyRegistered = event.registeredParticipants.some(
    (participantId) => participantId.toString() === userId.toString()
  );

  if (isAlreadyRegistered) {
    res.status(400);
    throw new Error('Already applied to this event');
  }

  if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
    res.status(400);
    throw new Error('Event is full, no more applications accepted');
  }

  event.registeredParticipants.push(new mongoose.Types.ObjectId(userId.toString()));
  await event.save();

  // Fetch user details to get their email
  const user = await User.findById(req.user!._id);
  if (!user) {
    console.error(`User with ID ${req.user!._id} not found for email reminder.`);
    res.status(500);
    throw new Error('User not found for email reminder');
  }

  // Send email reminder
  const emailMessage = `
    <h1>Event Application Confirmation</h1>
    <p>Dear ${user.name},</p>
    <p>You have successfully applied for the event: <strong>${event.title}</strong>.</p>
    <p>Here are the event details:</p>
    <ul>
      <li><strong>Event:</strong> ${event.title}</li>
      <li><strong>Type:</strong> ${event.type}</li>
      <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()} ${event.endDate ? `- ${new Date(event.endDate).toLocaleDateString()}` : ''}</li>
      <li><strong>Location:</strong> ${event.location}</li>
      <li><strong>Description:</strong> ${event.description.substring(0, 200)}...</li>
    </ul>
    <p>We look forward to seeing you there!</p>
    <p>Regards,</p>
    <p>The Palette Art Club Team</p>
  `;

  try {
    await sendEmail({
      email: user.iitgEmail, // Or personalEmail, depending on preference
      subject: `Confirmation: Applied for ${event.title}`,
      message: emailMessage,
    });
    console.log(`Reminder email sent to ${user.iitgEmail} for event ${event.title}.`);
  } catch (emailError) {
    console.error('Error sending reminder email:', emailError);
    // Optionally, you might not want to send a 500 error back to the user
    // if the application was successful but only the email failed.
    // For now, we'll just log it.
  }

  res.status(200).json({ 
    message: 'Successfully applied to the event', 
    event 
  });
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const eventId = getParamId(req.params.id);

  // Validate ObjectId
  if (!isValidObjectId(eventId)) {
    res.status(400);
    throw new Error('Invalid event ID format');
  }

  const event = await Event.findById(eventId)
    .populate('createdBy', 'name email')
    .populate('registeredParticipants', 'name email');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json(event);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body || {};
  const { title, description, date, location, type, maxParticipants, status, endDate, archiveOrder, loopOrder } = body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update event');
  }

  const eventId = getParamId(req.params.id);

  // Validate ObjectId
  if (!isValidObjectId(eventId)) {
    res.status(400);
    throw new Error('Invalid event ID format');
  }

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const previousEventState = {
    title: event.title,
    description: event.description,
    date: event.date?.toISOString(),
    location: event.location,
    type: event.type,
    status: event.status,
    archiveOrder: event.archiveOrder,
    loopOrder: event.loopOrder,
  };

  // Backfill legacy records that predate required createdBy.
  if (!event.createdBy && req.user?._id) {
    event.createdBy = new mongoose.Types.ObjectId(req.user._id.toString());
  }

  if (type && !['workshop', 'competition', 'event'].includes(type)) {
    res.status(400);
    throw new Error('Invalid event type');
  }

  if (date) {
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) {
      res.status(400);
      throw new Error('Invalid start date format');
    }
    event.date = newDate;
  }

  if (endDate !== undefined) { // Check if endDate was provided in the request body
    if (endDate === null || endDate === '') { // Allow clearing endDate
      event.endDate = undefined;
    } else {
      const newEndDate = new Date(endDate);
      if (isNaN(newEndDate.getTime())) {
        res.status(400);
        throw new Error('Invalid end date format');
      }
      // Ensure endDate is not before startDate if both are present
      if (event.date && newEndDate < event.date) {
          res.status(400);
          throw new Error('End date cannot be before start date');
      }
      event.endDate = newEndDate;
    }
  }

  if (maxParticipants !== undefined) {
    const maxPart = Number(maxParticipants);
    if (isNaN(maxPart) || maxPart < 1) {
      res.status(400);
      throw new Error('Max participants must be a positive number');
    }
    if (maxPart < event.registeredParticipants.length) {
      res.status(400);
      throw new Error(`Cannot reduce max participants below current registrations (${event.registeredParticipants.length})`);
    }
    event.maxParticipants = maxPart;
  }

  if (title) event.title = title;
  if (description) event.description = description;
  if (location) event.location = location;
  if (type) event.type = type as 'workshop' | 'competition' | 'event';
  if (status) event.status = status;

  if (archiveOrder !== undefined) {
    if (archiveOrder === null || archiveOrder === '') {
      event.archiveOrder = null;
    } else {
      const parsedArchive = Number(archiveOrder);
      if (isNaN(parsedArchive) || parsedArchive < 1) {
        res.status(400);
        throw new Error('Archive order must be a positive number');
      }
      event.archiveOrder = parsedArchive;
    }
  }

  if (loopOrder !== undefined) {
    if (loopOrder === null || loopOrder === '') {
      event.loopOrder = null;
    } else {
      const parsedLoop = Number(loopOrder);
      if (isNaN(parsedLoop) || parsedLoop < 1) {
        res.status(400);
        throw new Error('Loop order must be a positive number');
      }
      event.loopOrder = parsedLoop;
    }
  }

  let imageUpdated = false;
  if (req.file) {
    if (req.file.mimetype !== 'image/png') {
      res.status(400);
      throw new Error('Only PNG images are allowed for events.');
    }

    if (event.imageUrl) {
      const previousImagePath = path.join(__dirname, '../../uploads', path.basename(event.imageUrl));
      try {
        await fs.unlink(previousImagePath);
      } catch (err) {
        console.warn(`Could not remove previous event image: ${previousImagePath}`);
      }
    }

    event.imageUrl = `/uploads/${req.file.filename}`;
    imageUpdated = true;
  }

  const changeSummary: string[] = [];
  if (title !== undefined && title !== previousEventState.title) changeSummary.push(`title -> "${title}"`);
  if (description !== undefined && description !== previousEventState.description) changeSummary.push('description updated');
  if (date !== undefined) changeSummary.push(`start date -> ${new Date(event.date).toLocaleString()}`);
  if (location !== undefined && location !== previousEventState.location) changeSummary.push(`location -> "${location}"`);
  if (type !== undefined && type !== previousEventState.type) changeSummary.push(`type -> ${type}`);
  if (status !== undefined && status !== previousEventState.status) changeSummary.push(`status -> ${status}`);
  if (archiveOrder !== undefined && event.archiveOrder !== previousEventState.archiveOrder) {
    changeSummary.push(`archive order -> ${event.archiveOrder ?? 'none'}`);
  }
  if (loopOrder !== undefined && event.loopOrder !== previousEventState.loopOrder) {
    changeSummary.push(`loop order -> ${event.loopOrder ?? 'none'}`);
  }
  if (imageUpdated) {
    changeSummary.push('image updated');
  }

  const activityAction = (() => {
    if (changeSummary.length === 0) return 'Updated event';
    if (changeSummary.length === 1) {
      const onlyChange = changeSummary[0];
      if (onlyChange.startsWith('archive order')) return 'Updated archive order';
      if (onlyChange.startsWith('loop order')) return 'Updated loop order';
      if (onlyChange.startsWith('status')) return 'Updated status';
      if (onlyChange.startsWith('start date')) return 'Updated start date';
      if (onlyChange.startsWith('location')) return 'Updated location';
      if (onlyChange.startsWith('type')) return 'Updated event type';
      if (onlyChange.startsWith('title')) return 'Updated title';
      if (onlyChange.startsWith('description')) return 'Updated description';
    }
    return 'Updated event';
  })();

  const updatedEvent = await event.save();
  await logAdminAction(
    req,
    activityAction,
    'event',
    updatedEvent._id.toString(),
    changeSummary.length
      ? `Updated ${updatedEvent.type} "${updatedEvent.title}" (${changeSummary.join(', ')})`
      : `Updated ${updatedEvent.type} "${updatedEvent.title}"`,
    {
      title: updatedEvent.title,
      type: updatedEvent.type,
      status: updatedEvent.status,
      archiveOrder: updatedEvent.archiveOrder,
      loopOrder: updatedEvent.loopOrder,
      changes: changeSummary,
    }
  );
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete event');
  }

  const eventId = getParamId(req.params.id);

  // Validate ObjectId
  if (!isValidObjectId(eventId)) {
    res.status(400);
    throw new Error('Invalid event ID format');
  }

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.registeredParticipants.length > 0) {
    console.warn(`Deleting event ${event._id} with ${event.registeredParticipants.length} registered participants`);
  }

  // Delete the image file from the uploads directory
  if (event.imageUrl) {
    const imagePath = path.join(__dirname, '../../uploads', path.basename(event.imageUrl));
    try {
      await fs.unlink(imagePath);
      console.log(`Deleted event image: ${imagePath}`);
    } catch (err: any) {
      console.error(`Failed to delete event image: ${imagePath}`, err);
      // Decide if you should return an error or just log it.
      // For now, we'll just log it and proceed with deleting the DB record.
    }
  }

  await event.deleteOne();
  await logAdminAction(
    req,
    'Deleted event',
    'event',
    event._id.toString(),
    `Deleted ${event.type} "${event.title}"`,
    {
      title: event.title,
      type: event.type,
      status: event.status,
      registeredParticipants: event.registeredParticipants.length,
    }
  );
  res.json({ message: 'Event removed successfully' });
});

// @desc    Get events user is registered for
// @route   GET /api/events/my-events
// @access  Private
export const getMyEvents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const events = await Event.find({
    registeredParticipants: req.user._id
  }).sort('date');

  res.json(events);
});

// @desc    Cancel registration for an event
// @route   DELETE /api/events/:id/cancel
// @access  Private
export const cancelEventRegistration = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const eventId = getParamId(req.params.id);
  const userId = req.user._id;

  // Validate ObjectId
  if (!isValidObjectId(eventId)) {
    res.status(400);
    throw new Error('Invalid event ID format');
  }

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const participantIndex = event.registeredParticipants.findIndex(
    (participantId) => participantId.toString() === userId.toString()
  );

  if (participantIndex === -1) {
    res.status(400);
    throw new Error('You are not registered for this event');
  }

  event.registeredParticipants.splice(participantIndex, 1);
  await event.save();

  res.json({ message: 'Successfully cancelled registration', event });
});
