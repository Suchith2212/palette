import { Request, Response } from 'express';
import User from '../models/User';
import Artwork from '../models/Artwork';
import Event from '../models/Event';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  const { personalEmail, name, phoneNumber, password } = req.body;

  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.personalEmail = personalEmail || user.personalEmail;
      user.name = name || user.name;
      user.phoneNumber = phoneNumber || user.phoneNumber;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        personalEmail: updatedUser.personalEmail,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        isAdmin: updatedUser.isAdmin,
        isVerified: updatedUser.isVerified
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's submitted artwork
// @route   GET /api/users/my-artwork
// @access  Private
export const getMyArtwork = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }
    const artwork = await Artwork.find({ artist: req.user._id } as any).sort({ createdAt: -1 });
    res.json(artwork);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's registered events
// @route   GET /api/users/my-events
// @access  Private
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }
    // Corrected to use 'registeredParticipants' as defined in Event model
    const events = await Event.find({ registeredParticipants: req.user._id } as any).sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
