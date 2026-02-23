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
exports.deleteArtwork = exports.addArtworkScore = exports.updateArtworkStatus = exports.getArtworkById = exports.getMyArtworks = exports.getAllArtworks = exports.uploadArtwork = void 0;
const Artwork_1 = __importDefault(require("../models/Artwork"));
const path_1 = __importDefault(require("path")); // Import path module
// @desc    Upload new artwork
// @route   POST /api/artwork
// @access  Private
const uploadArtwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('--- uploadArtwork called ---');
        console.log('req.user:', req.user);
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        const { title, description, credits } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`; // Construct URL from uploaded filename
        if (!title) {
            return res.status(400).json({ message: 'Please provide title for the artwork' });
        }
        if (!credits) { // Add validation for credits
            return res.status(400).json({ message: 'Please provide credits for the artwork' });
        }
        const artwork = new Artwork_1.default({
            title,
            description,
            credits, // Add credits to the artwork creation
            imageUrl,
            artist: req.user._id,
            status: 'pending', // Default status for new uploads
        });
        const createdArtwork = yield artwork.save();
        res.status(201).json(createdArtwork);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.uploadArtwork = uploadArtwork;
// @desc    Get all artworks (for E-Arts section, potentially with filters)
// @route   GET /api/artwork
// @access  Public
const getAllArtworks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Optionally filter by status, e.g., only show approved artwork to public
        // Admins might see all, or specific statuses
        const filter = { status: 'approved' };
        if (req.user && req.user.isAdmin) {
            // Admins can see all, or query with a status filter if provided
            if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
                filter.status = req.query.status;
            }
            else {
                delete filter.status; // Admins see all if no status filter
            }
        }
        else if (req.user) {
            // Logged-in users can see their own pending/rejected artwork, plus all approved
            delete filter.status; // Remove general approved filter
            filter.$or = [{ status: 'approved' }, { artist: req.user._id }];
        }
        else {
            // Public users only see approved
            filter.status = 'approved';
        }
        const artworks = yield Artwork_1.default.find(filter)
            .populate('artist', 'name iitgEmail rollNumber') // Populate artist name and email
            .sort('-createdAt'); // Latest first
        res.json(artworks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllArtworks = getAllArtworks;
// @desc    Get artworks submitted by the current user
// @route   GET /api/artwork/my-artworks
// @access  Private
const getMyArtworks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        const artworks = yield Artwork_1.default.find({ artist: req.user._id }).sort('-createdAt');
        res.json(artworks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMyArtworks = getMyArtworks;
// @desc    Get single artwork by ID
// @route   GET /api/artwork/:id
// @access  Public (but can be restricted by status)
const getArtworkById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artwork = yield Artwork_1.default.findById(req.params.id).populate('artist', 'name iitgEmail rollNumber');
        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        // Only show pending/rejected to artist or admin
        if (artwork.status !== 'approved' && (!req.user || (artwork.artist.toString() !== req.user._id.toString() && !req.user.isAdmin))) {
            return res.status(403).json({ message: 'Not authorized to view this artwork' });
        }
        res.json(artwork);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getArtworkById = getArtworkById;
// @desc    Update artwork status (Admin only)
// @route   PUT /api/artwork/:id/status
// @access  Private/Admin
const updateArtworkStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update artwork status' });
        }
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const artwork = yield Artwork_1.default.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        artwork.status = status;
        const updatedArtwork = yield artwork.save();
        res.json(updatedArtwork);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateArtworkStatus = updateArtworkStatus;
// @desc    Add/Update artwork score (Admin only)
// @route   PUT /api/artwork/:id/score
// @access  Private/Admin
const addArtworkScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to add/update score' });
        }
        const { score } = req.body;
        if (typeof score !== 'number' || score < 0 || score > 100) {
            return res.status(400).json({ message: 'Score must be a number between 0 and 100' });
        }
        const artwork = yield Artwork_1.default.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        artwork.score = score;
        const updatedArtwork = yield artwork.save();
        res.json(updatedArtwork);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addArtworkScore = addArtworkScore;
const fs_1 = require("fs");
// @desc    Delete an artwork (Admin only or Artist if pending)
// @route   DELETE /api/artwork/:id
// @access  Private/Admin or Private/Artist (if pending)
const deleteArtwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        const artwork = yield Artwork_1.default.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        // Only admin or the artist (if artwork is pending) can delete
        if (!req.user.isAdmin && (artwork.artist.toString() !== req.user._id.toString() || artwork.status !== 'pending')) {
            return res.status(403).json({ message: 'Not authorized to delete this artwork' });
        }
        // Delete the image file from the uploads directory
        if (artwork.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '..', '..', 'uploads', path_1.default.basename(artwork.imageUrl));
            try {
                yield fs_1.promises.unlink(imagePath);
            }
            catch (err) {
                console.error(`Failed to delete artwork image: ${imagePath}`, err);
                // Decide if you should return an error or just log it.
                // For now, we'll just log it and proceed with deleting the DB record.
            }
        }
        yield artwork.deleteOne();
        res.json({ message: 'Artwork removed' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteArtwork = deleteArtwork;
