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
exports.updateUserProfile = exports.getMe = exports.loginUser = exports.verifyUserCode = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // This should be a strong, unique key
// Helper function to generate a 6-digit numeric code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const nodemailer_1 = __importDefault(require("nodemailer"));
// ... (other imports)
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { iitgEmail, personalEmail, password, name, rollNumber, phoneNumber } = req.body;
    try {
        // Validate IITG email domain
        if (!iitgEmail || !iitgEmail.endsWith('@iitgn.ac.in')) {
            return res.status(400).json({ message: 'IITG email must end with @iitgn.ac.in' });
        }
        // Check if user already exists
        let user = yield User_1.default.findOne({ $or: [{ iitgEmail }, { personalEmail }, { rollNumber }] });
        if (user) {
            return res.status(400).json({ message: 'User with provided IITG email, personal email or roll number already exists' });
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create new user
        // Generate verification code and expiry
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour from now
        user = yield User_1.default.create({
            iitgEmail,
            personalEmail,
            password: hashedPassword,
            name,
            rollNumber,
            phoneNumber,
            verificationCode, // Save code
            verificationCodeExpires, // Save expiry
        });
        // Send verification email
        // TODO: Configure your email transport (e.g., using an SMTP service like SendGrid or Gmail)
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: '"Palette" <noreply@palette.com>', // sender address
            to: user.iitgEmail, // list of receivers
            subject: 'Verify your Palette Account Email', // Subject line
            html: `
        <p>Hello ${user.name},</p>
        <p>Thank you for registering for a Palette account.</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 1 hour.</p>
        <p>Please enter this code on the verification page to activate your account.</p>
        <p>If you did not create this account, you can safely ignore this email.</p>
        <p>Best,</p>
        <p>The Palette Team</p>
      `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending verification email:', error);
                // In a production app, you might want to handle this more gracefully
                // For example, by not creating the user or by queuing the email for a retry
            }
            else {
                console.log('Verification email sent: %s', info.messageId);
                // For Ethereal Email, you can get a preview URL
            }
        });
        res.status(201).json({
            message: 'User registered successfully. Please check your IITG email for the verification code.',
            userId: user._id,
            iitgEmail: user.iitgEmail, // Send email back to frontend for verification page
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.registerUser = registerUser;
// @desc    Verify user's IITG email with numeric code
// @route   POST /api/auth/verify-code
// @access  Public
const verifyUserCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { iitgEmail, verificationCode } = req.body;
    try {
        const user = yield User_1.default.findOne({ iitgEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }
        if (!user.verificationCode || user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }
        if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: 'Verification code expired.' });
        }
        user.isVerified = true;
        user.verificationCode = undefined; // Clear code after successful verification
        user.verificationCodeExpires = undefined; // Clear expiry
        yield user.save();
        res.json({ message: 'IITG email verified successfully. You can now log in.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.verifyUserCode = verifyUserCode;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { loginIdentifier, password } = req.body;
    try {
        // Check if user exists by personal email or IITG email
        let user = yield User_1.default.findOne({ personalEmail: loginIdentifier });
        if (!user) {
            user = yield User_1.default.findOne({ iitgEmail: loginIdentifier });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check if IITG email is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your IITG email first.' });
        }
        // Check password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                personalEmail: user.personalEmail,
                isAdmin: user.isAdmin
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.loginUser = loginUser;
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // req.user is populated by the protect middleware
    if (req.user) {
        res.json(req.user);
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
});
exports.getMe = getMe;
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no user found' });
    }
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.personalEmail = req.body.personalEmail || user.personalEmail;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        // If user wants to update password, they must provide their current one
        if (req.body.password) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: 'Please provide current password to update your password.' });
            }
            const isMatch = yield bcryptjs_1.default.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid current password.' });
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(req.body.password, salt);
        }
        // Prevent direct modification of iitgEmail, rollNumber, isAdmin, isVerified via this route
        // These fields might require separate admin-level controls or specific workflows.
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            iitgEmail: updatedUser.iitgEmail,
            personalEmail: updatedUser.personalEmail,
            rollNumber: updatedUser.rollNumber,
            phoneNumber: updatedUser.phoneNumber,
            isAdmin: updatedUser.isAdmin,
            isVerified: updatedUser.isVerified,
        });
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
});
exports.updateUserProfile = updateUserProfile;
