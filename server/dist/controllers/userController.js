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
exports.getMyEvents = exports.getMyArtwork = exports.updateUserProfile = exports.getUserProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Artwork_1 = __importDefault(require("../models/Artwork"));
const Event_1 = __importDefault(require("../models/Event"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserProfile = getUserProfile;
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { personalEmail, name, phoneNumber, password } = req.body;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (user) {
            user.personalEmail = personalEmail || user.personalEmail;
            user.name = name || user.name;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            if (password) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                user.password = yield bcryptjs_1.default.hash(password, salt);
            }
            const updatedUser = yield user.save();
            res.json({
                id: updatedUser._id,
                personalEmail: updatedUser.personalEmail,
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
                isAdmin: updatedUser.isAdmin,
                isVerified: updatedUser.isVerified
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
// @desc    Get user's submitted artwork
// @route   GET /api/users/my-artwork
// @access  Private
const getMyArtwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        const artwork = yield Artwork_1.default.find({ artist: req.user._id }).sort({ createdAt: -1 });
        res.json(artwork);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMyArtwork = getMyArtwork;
// @desc    Get user's registered events
// @route   GET /api/users/my-events
// @access  Private
const getMyEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        // Corrected to use 'registeredParticipants' as defined in Event model
        const events = yield Event_1.default.find({ registeredParticipants: req.user._id }).sort({ date: -1 });
        res.json(events);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMyEvents = getMyEvents;
