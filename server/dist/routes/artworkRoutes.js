"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const artworkController_1 = require("../controllers/artworkController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // Import the configured multer upload middleware
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, multerConfig_1.default.single('image'), artworkController_1.uploadArtwork); // User uploads artwork, 'image' is the field name for the file
router.get('/my-artworks', authMiddleware_1.protect, artworkController_1.getMyArtworks); // Get artworks by current user
router.get('/', artworkController_1.getAllArtworks); // Get all artworks (publicly visible by default, admin can filter)
router.get('/:id', authMiddleware_1.protect, artworkController_1.getArtworkById); // Get single artwork (publicly visible if approved, private if by artist/admin)
router.put('/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), artworkController_1.updateArtworkStatus); // Admin updates status
router.put('/:id/score', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), artworkController_1.addArtworkScore); // Admin adds/updates score
router.delete('/:id', authMiddleware_1.protect, artworkController_1.deleteArtwork); // Admin or artist (if pending) deletes artwork
exports.default = router;
