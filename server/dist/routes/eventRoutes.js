"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // Import multer instance
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Public routes for fetching events
router.get('/workshops', eventController_1.getUpcomingWorkshops);
router.get('/competitions', eventController_1.getUpcomingCompetitions);
router.get('/upcoming', eventController_1.getUpcomingEvents); // New route for all upcoming events
router.get('/past', eventController_1.getPastEvents);
// Private/Admin routes
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), multerConfig_1.default.single('image'), // Reverted to upload.single('image')
(err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        // A Multer error occurred when uploading.
        console.error('Multer Error:', err.message);
        return res.status(400).json({ message: err.message, type: 'MulterError' });
    }
    else if (err) {
        // An unknown error occurred when uploading.
        console.error('Unknown upload error:', err.message);
        return res.status(500).json({ message: err.message, type: 'UnknownError' });
    }
    next(); // Continue to the createEvent controller
}, eventController_1.createEvent);
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), eventController_1.updateEvent); // Admin-only route to update an event
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), eventController_1.deleteEvent); // Admin-only route to delete an event
// User-specific routes
router.post('/:id/apply', authMiddleware_1.protect, eventController_1.applyToEvent);
// General route for fetching a single event by ID - should be last among GETs
router.get('/:id', eventController_1.getEventById);
exports.default = router;
