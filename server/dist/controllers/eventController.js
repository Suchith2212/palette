"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelEventRegistration = exports.getMyEvents = exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.applyToEvent = exports.createEvent = exports.getPastEvents = exports.getUpcomingCompetitions = exports.getUpcomingWorkshops = exports.getUpcomingEvents = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = __importDefault(require("../models/Event"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const sendEmail_1 = __importDefault(require("../utils/sendEmail")); // Import sendEmail utility
const User_1 = __importDefault(require("../models/User")); // Import User model to get user email
// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
    if (!id || Array.isArray(id))
        return false;
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
// Helper to ensure string from params
const getParamId = (id) => {
    if (Array.isArray(id))
        return id[0];
    return id || '';
};
// IST offset in milliseconds (UTC+5:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
// Helper to get the start of the current day in IST, converted back to UTC
const getStartOfUserDayUTC = (utcDate) => {
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
exports.getUpcomingEvents = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.query;
    const now = new Date();
    const startOfTodayForUser = getStartOfUserDayUTC(now);
    const conditions = [
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
    const events = yield Event_1.default.find({ $and: conditions }).sort('date');
    res.json(events);
}));
// @desc    Get all upcoming workshops
// @route   GET /api/events/workshops
// @access  Public
exports.getUpcomingWorkshops = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const startOfTodayForUser = getStartOfUserDayUTC(now);
    const workshops = yield Event_1.default.find({
        type: 'workshop',
        $or: [
            { endDate: { $gte: startOfTodayForUser } },
            { endDate: { $exists: false }, date: { $gte: startOfTodayForUser } }
        ]
    }).sort('date');
    res.json(workshops);
}));
// @desc    Get all upcoming competitions
// @route   GET /api/events/competitions
// @access  Public
exports.getUpcomingCompetitions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const startOfTodayForUser = getStartOfUserDayUTC(now);
    const competitions = yield Event_1.default.find({
        type: 'competition',
        $or: [
            { endDate: { $gte: startOfTodayForUser } },
            { endDate: { $exists: false }, date: { $gte: startOfTodayForUser } }
        ]
    }).sort('date');
    res.json(competitions);
}));
// @desc    Get all past events, categorized
// @route   GET /api/events/past
// @access  Public
exports.getPastEvents = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const startOfTodayForUser = getStartOfUserDayUTC(now);
    const startOfNextDayForUser = new Date(startOfTodayForUser.getTime());
    startOfNextDayForUser.setUTCDate(startOfTodayForUser.getUTCDate() + 1); // Start of next day in user's timezone (UTC)
    const conditions = [
        {
            $or: [
                // If an endDate exists, it must be strictly less than the start of the next day (in user's timezone)
                { endDate: { $lt: startOfNextDayForUser } },
                // If no endDate, the main date must be strictly less than the start of the next day (in user's timezone)
                { endDate: { $exists: false }, date: { $lt: startOfNextDayForUser } }
            ]
        }
    ];
    const pastEvents = yield Event_1.default.find({ $and: conditions }).sort('-date');
    res.json(pastEvents);
}));
// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const imageUrl = `/uploads/${req.file.filename}`;
    const event = new Event_1.default({
        title,
        description,
        date: eventDate,
        endDate: eventEndDate,
        location,
        type,
        imageUrl,
        maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        createdBy: req.user._id,
    });
    const createdEvent = yield event.save();
    res.status(201).json(createdEvent);
}));
// @desc    Apply to an event
// @route   POST /api/events/:id/apply
// @access  Private
exports.applyToEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const event = yield Event_1.default.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    const now = new Date();
    const startOfTodayForUser = getStartOfUserDayUTC(now);
    if (event.endDate ? event.endDate < startOfTodayForUser : event.date < startOfTodayForUser) {
        res.status(400);
        throw new Error('Cannot apply to a past event');
    }
    // Better check for existing registration
    const isAlreadyRegistered = event.registeredParticipants.some((participantId) => participantId.toString() === userId.toString());
    if (isAlreadyRegistered) {
        res.status(400);
        throw new Error('Already applied to this event');
    }
    if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
        res.status(400);
        throw new Error('Event is full, no more applications accepted');
    }
    event.registeredParticipants.push(new mongoose_1.default.Types.ObjectId(userId.toString()));
    yield event.save();
    // Fetch user details to get their email
    const user = yield User_1.default.findById(req.user._id);
    if (!user) {
        console.error(`User with ID ${req.user._id} not found for email reminder.`);
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
        yield (0, sendEmail_1.default)({
            email: user.iitgEmail, // Or personalEmail, depending on preference
            subject: `Confirmation: Applied for ${event.title}`,
            message: emailMessage,
        });
        console.log(`Reminder email sent to ${user.iitgEmail} for event ${event.title}.`);
    }
    catch (emailError) {
        console.error('Error sending reminder email:', emailError);
        // Optionally, you might not want to send a 500 error back to the user
        // if the application was successful but only the email failed.
        // For now, we'll just log it.
    }
    res.status(200).json({
        message: 'Successfully applied to the event',
        event
    });
}));
// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = getParamId(req.params.id);
    // Validate ObjectId
    if (!isValidObjectId(eventId)) {
        res.status(400);
        throw new Error('Invalid event ID format');
    }
    const event = yield Event_1.default.findById(eventId)
        .populate('createdBy', 'name email')
        .populate('registeredParticipants', 'name email');
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    res.json(event);
}));
// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, date, location, type, maxParticipants, status, endDate } = req.body;
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
    const event = yield Event_1.default.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
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
        }
        else {
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
    if (title)
        event.title = title;
    if (description)
        event.description = description;
    if (location)
        event.location = location;
    if (type)
        event.type = type;
    if (status)
        event.status = status;
    const updatedEvent = yield event.save();
    res.json(updatedEvent);
}));
// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const event = yield Event_1.default.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    if (event.registeredParticipants.length > 0) {
        console.warn(`Deleting event ${event._id} with ${event.registeredParticipants.length} registered participants`);
    }
    // Delete the image file from the uploads directory
    if (event.imageUrl) {
        const imagePath = path_1.default.join(__dirname, '../../uploads', path_1.default.basename(event.imageUrl));
        try {
            yield fs_1.promises.unlink(imagePath);
            console.log(`Deleted event image: ${imagePath}`);
        }
        catch (err) {
            console.error(`Failed to delete event image: ${imagePath}`, err);
            // Decide if you should return an error or just log it.
            // For now, we'll just log it and proceed with deleting the DB record.
        }
    }
    yield event.deleteOne();
    res.json({ message: 'Event removed successfully' });
}));
// @desc    Get events user is registered for
// @route   GET /api/events/my-events
// @access  Private
exports.getMyEvents = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authenticated');
    }
    const events = yield Event_1.default.find({
        registeredParticipants: req.user._id
    }).sort('date');
    res.json(events);
}));
// @desc    Cancel registration for an event
// @route   DELETE /api/events/:id/cancel
// @access  Private
exports.cancelEventRegistration = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const event = yield Event_1.default.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    const participantIndex = event.registeredParticipants.findIndex((participantId) => participantId.toString() === userId.toString());
    if (participantIndex === -1) {
        res.status(400);
        throw new Error('You are not registered for this event');
    }
    event.registeredParticipants.splice(participantIndex, 1);
    yield event.save();
    res.json({ message: 'Successfully cancelled registration', event });
}));
