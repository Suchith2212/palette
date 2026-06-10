import { Request, Response } from 'express';
import Artwork from '../models/Artwork';
import User from '../models/User';
import { authorize } from '../middleware/authMiddleware';
import path from 'path'; // Import path module
import { promises as fs } from 'fs';
import mongoose from 'mongoose';
import { logAdminAction } from '../utils/adminAudit';

// @desc    Upload new artwork
// @route   POST /api/artwork
// @access  Private
const publicArtistFields = 'name photoUrl';
const privateArtistFields = 'name photoUrl personalEmail iitgEmail phoneNumber';

const getArtistFields = (req: Request) =>
  req.user?.isAdmin ? privateArtistFields : publicArtistFields;

export const uploadArtwork = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const { title, description, credits, type } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`; // Construct URL from uploaded filename

    if (!title) {
      return res.status(400).json({ message: 'Please provide title for the artwork' });
    }
    if (!credits) { // Add validation for credits
        return res.status(400).json({ message: 'Please provide credits for the artwork' });
    }
    const normalizedType = String(type || '').trim().toLowerCase();
    if (!['painting', 'sketch', 'digital', 'other'].includes(normalizedType)) {
      return res.status(400).json({ message: 'Please select a valid artwork type' });
    }

    const artwork = new Artwork({
      title,
      description,
      credits, // Add credits to the artwork creation
      type: normalizedType,
      imageUrl,
      artist: req.user._id,
      status: 'pending', // Default status for new uploads
    });

    const createdArtwork = await artwork.save();
    res.status(201).json(createdArtwork);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all artworks (for E-Arts section, potentially with filters)
// @route   GET /api/artwork
// @access  Public
export const getAllArtworks = async (req: Request, res: Response) => {
  try {
    // Optionally filter by status, e.g., only show approved artwork to public
    // Admins might see all, or specific statuses
    const filter: any = { status: 'approved' }; 
    if (req.user && req.user.isAdmin) {
      // Admins can see all, or query with a status filter if provided
      if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status as string)) {
        filter.status = req.query.status;
      } else {
        delete filter.status; // Admins see all if no status filter
      }
    } else if (req.user) {
        // Logged-in users can see their own pending/rejected artwork, plus all approved
        delete filter.status; // Remove general approved filter
        filter.$or = [{ status: 'approved' }, { artist: req.user._id } as any];
    } else {
        // Public users only see approved
        filter.status = 'approved';
    }


    const artworks = await Artwork.find(filter)
      .populate('artist', getArtistFields(req))
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json(artworks);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artworks submitted by the current user
// @route   GET /api/artwork/my-artworks
// @access  Private
export const getMyArtworks = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        const artworks = await Artwork.find({ artist: req.user._id } as any).sort('-createdAt');
        res.json(artworks);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Get single artwork by ID
// @route   GET /api/artwork/:id
// @access  Public (but can be restricted by status)
export const getArtworkById = async (req: Request, res: Response) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate('artist', getArtistFields(req));
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const artistRef = artwork.artist as any;
    const artistId =
      artistRef?._id != null
        ? String(artistRef._id)
        : String(artwork.artist);

    if (
      artwork.status !== 'approved' &&
      (!req.user || (artistId !== req.user._id.toString() && !req.user.isAdmin))
    ) {
      return res.status(403).json({ message: 'Not authorized to view this artwork' });
    }

    res.json(artwork);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update artwork status (Admin only)
// @route   PUT /api/artwork/:id/status
// @access  Private/Admin
export const updateArtworkStatus = async (req: Request, res: Response) => {
  try {
  if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update artwork status' });
    }

    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const previousStatus = artwork.status;
    artwork.status = status;
    const updatedArtwork = await artwork.save();
    await logAdminAction(
      req,
      `Artwork ${status}`,
      'artwork',
      artwork._id.toString(),
      `Artwork "${artwork.title}" changed from ${previousStatus} to ${status}`,
      { statusBefore: previousStatus, statusAfter: status, artworkTitle: artwork.title, artistId: artwork.artist?.toString() }
    );
    res.json(updatedArtwork);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add/Update artwork score (Admin only)
// @route   PUT /api/artwork/:id/score
// @access  Private/Admin
export const addArtworkScore = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to add/update score' });
    }

    const { score } = req.body;
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be a number between 0 and 100' });
    }

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const previousScore = artwork.score;
    artwork.score = score;
    const updatedArtwork = await artwork.save();
    await logAdminAction(
      req,
      `Artwork score updated`,
      'artwork',
      artwork._id.toString(),
      `Artwork "${artwork.title}" score changed from ${previousScore ?? 'unset'} to ${score}`,
      { scoreBefore: previousScore ?? null, scoreAfter: score, artworkTitle: artwork.title, artistId: artwork.artist?.toString() }
    );
    res.json(updatedArtwork);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update artwork display order (Admin only)
// @route   PUT /api/artwork/:id/order
// @access  Private/Admin
export const updateArtworkOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update artwork order' });
    }

    const { displayOrder } = req.body;
    const parsedOrder = displayOrder === null || displayOrder === undefined || displayOrder === ''
      ? null
      : Number(displayOrder);

    if (parsedOrder !== null && (Number.isNaN(parsedOrder) || parsedOrder < 0)) {
      return res.status(400).json({ message: 'displayOrder must be a non-negative number or null' });
    }

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const previousOrder = artwork.displayOrder ?? null;
    artwork.displayOrder = parsedOrder;
    const updatedArtwork = await artwork.save();

    await logAdminAction(
      req,
      'Artwork display order updated',
      'artwork',
      artwork._id.toString(),
      `Artwork "${artwork.title}" display order changed from ${previousOrder ?? 'unset'} to ${parsedOrder ?? 'unset'}`,
      {
        displayOrderBefore: previousOrder,
        displayOrderAfter: parsedOrder,
        artworkTitle: artwork.title,
      }
    );

    return res.json(updatedArtwork);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update artwork details (Admin only)
// @route   PUT /api/artwork/:id
// @access  Private/Admin
export const updateArtworkDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit artwork' });
    }

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const nextTitle = String(req.body.title ?? artwork.title).trim();
    const nextDescription = String(req.body.description ?? artwork.description ?? '').trim();
    const nextCredits = String(req.body.credits ?? artwork.credits).trim();
    const nextType = String(req.body.type ?? artwork.type).trim().toLowerCase();

    if (!nextTitle) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!nextCredits) {
      return res.status(400).json({ message: 'Credits are required' });
    }
    if (!['painting', 'sketch', 'digital', 'other'].includes(nextType)) {
      return res.status(400).json({ message: 'Please select a valid artwork type' });
    }

    const before = {
      title: artwork.title,
      description: artwork.description ?? '',
      credits: artwork.credits,
      type: artwork.type,
    };

    artwork.title = nextTitle;
    artwork.description = nextDescription || undefined;
    artwork.credits = nextCredits;
    artwork.type = nextType as 'painting' | 'sketch' | 'digital' | 'other';

    const updatedArtwork = await artwork.save();

    await logAdminAction(
      req,
      'Artwork details updated',
      'artwork',
      artwork._id.toString(),
      `Artwork "${before.title}" details edited by admin`,
      {
        before,
        after: {
          title: updatedArtwork.title,
          description: updatedArtwork.description ?? '',
          credits: updatedArtwork.credits,
          type: updatedArtwork.type,
        },
      }
    );

    return res.json(updatedArtwork);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an artwork (Admin only or Artist if pending)
// @route   DELETE /api/artwork/:id
// @access  Private/Admin or Private/Artist (if pending)
export const deleteArtwork = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Only admin or the artist (if artwork is pending) can delete
    if (!req.user.isAdmin && (artwork.artist.toString() !== req.user._id.toString() || artwork.status !== 'pending')) {
      return res.status(403).json({ message: 'Not authorized to delete this artwork' });
    }

    // Delete the image file from the uploads directory
    if (artwork.imageUrl) {
      const imagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(artwork.imageUrl));
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error(`Failed to delete artwork image: ${imagePath}`, err);
        // Decide if you should return an error or just log it.
        // For now, we'll just log it and proceed with deleting the DB record.
      }
    }

    await artwork.deleteOne();
    await logAdminAction(
      req,
      'Artwork deleted',
      'artwork',
      artwork._id.toString(),
      `Artwork "${artwork.title}" removed from the system`,
      { artworkTitle: artwork.title, artistId: artwork.artist?.toString(), status: artwork.status }
    );
    res.json({ message: 'Artwork removed' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
