import { Request, Response } from 'express';
import HomeStats from '../models/HomeStats';
import { logAdminAction } from '../utils/adminAudit';

const DEFAULT_STATS = {
  key: 'home',
  workshops: 25,
  competitions: 12,
  artworks: 100,
  engaged: 600,
};

export const getHomeStats = async (_req: Request, res: Response) => {
  try {
    const existingStats = await HomeStats.findOne({ key: 'home' });
    const stats = existingStats || (await HomeStats.create(DEFAULT_STATS));

    return res.json({
      workshops: stats.workshops,
      competitions: stats.competitions,
      artworks: stats.artworks,
      engaged: stats.engaged,
      updatedAt: stats.updatedAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load homepage stats.' });
  }
};

export const updateHomeStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const nextValues = {
      workshops: Number(req.body.workshops),
      competitions: Number(req.body.competitions),
      artworks: Number(req.body.artworks),
      engaged: Number(req.body.engaged),
    };

    const hasInvalidValue = Object.values(nextValues).some((value) =>
      Number.isNaN(value) || value < 0 || !Number.isFinite(value)
    );

    if (hasInvalidValue) {
      return res.status(400).json({ message: 'All stat values must be valid non-negative numbers.' });
    }

    const previous = await HomeStats.findOne({ key: 'home' }).lean();
    const updated = await HomeStats.findOneAndUpdate(
      { key: 'home' },
      { $set: nextValues },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update homepage stats.' });
    }

    await logAdminAction(
      req,
      'Updated homepage stats',
      'system',
      null,
      `${req.user.name} updated homepage counters`,
      {
        before: previous
          ? {
              workshops: previous.workshops,
              competitions: previous.competitions,
              artworks: previous.artworks,
              engaged: previous.engaged,
            }
          : null,
        after: nextValues,
      }
    );

    return res.json({
      message: 'Homepage stats updated successfully.',
      stats: {
        workshops: updated.workshops,
        competitions: updated.competitions,
        artworks: updated.artworks,
        engaged: updated.engaged,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update homepage stats.' });
  }
};
