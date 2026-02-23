import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // This should be a strong, unique key

// Helper function to generate a 6-digit numeric code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

import nodemailer from 'nodemailer';

// ... (other imports)

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { iitgEmail, personalEmail, password, name, rollNumber, phoneNumber } = req.body;

  try {
    // Validate IITG email domain
    if (!iitgEmail || !iitgEmail.endsWith('@iitgn.ac.in')) {
      return res.status(400).json({ message: 'IITG email must end with @iitgn.ac.in' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ iitgEmail }, { personalEmail }, { rollNumber }] });
    if (user) {
      return res.status(400).json({ message: 'User with provided IITG email, personal email or roll number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    // Generate verification code and expiry
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour from now

    user = await User.create({
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
    const transporter = nodemailer.createTransport({
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
      } else {
        console.log('Verification email sent: %s', info.messageId);
        // For Ethereal Email, you can get a preview URL

      }
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your IITG email for the verification code.',
      userId: user._id,
      iitgEmail: user.iitgEmail, // Send email back to frontend for verification page
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify user's IITG email with numeric code
// @route   POST /api/auth/verify-code
// @access  Public
export const verifyUserCode = async (req: Request, res: Response) => {
  const { iitgEmail, verificationCode } = req.body;

  try {
    const user = await User.findOne({ iitgEmail });

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
    await user.save();

    res.json({ message: 'IITG email verified successfully. You can now log in.' });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { loginIdentifier, password } = req.body;

  try {
    // Check if user exists by personal email or IITG email
    let user = await User.findOne({ personalEmail: loginIdentifier });
    if (!user) {
      user = await User.findOne({ iitgEmail: loginIdentifier });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if IITG email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your IITG email first.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, {
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

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  // req.user is populated by the protect middleware
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user found' });
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.personalEmail = req.body.personalEmail || user.personalEmail;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // If user wants to update password, they must provide their current one
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Please provide current password to update your password.' });
      }

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid current password.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    // Prevent direct modification of iitgEmail, rollNumber, isAdmin, isVerified via this route
    // These fields might require separate admin-level controls or specific workflows.

    const updatedUser = await user.save();

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
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
