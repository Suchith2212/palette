import { Request, Response } from 'express';
import User from '../models/User';
import AdminAction from '../models/AdminAction';
import { logAdminAction } from '../utils/adminAudit';

export const getAdmins = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const admins = await User.find({ isAdmin: true })
      .select('-password -verificationCode -verificationCodeExpires')
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const activity = await AdminAction.find({})
      .populate('actor', 'name iitgEmail')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find({})
      .select('-password -verificationCode -verificationCodeExpires')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const promoteUserToAdmin = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.isAdmin = true;
    await user.save();

    await logAdminAction(req, 'Promoted user to admin', 'user', user._id.toString(), `${req.user.name} promoted ${user.name} to admin`, {
      promotedUser: {
        id: user._id,
        name: user.name,
        iitgEmail: user.iitgEmail,
      },
    });

    res.json({
      message: 'User promoted to admin',
      user: {
        _id: user._id,
        name: user.name,
        iitgEmail: user.iitgEmail,
        personalEmail: user.personalEmail,
        phoneNumber: user.phoneNumber,
        photoUrl: user.photoUrl,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
