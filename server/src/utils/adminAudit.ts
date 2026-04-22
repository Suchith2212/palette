import { Request } from 'express';
import { Types } from 'mongoose';
import AdminAction from '../models/AdminAction';

type EntityType = 'event' | 'artwork' | 'user' | 'system' | 'exhibition' | 'contact';

export const logAdminAction = async (
  req: Request,
  action: string,
  entityType: EntityType,
  entityId?: string | null,
  details?: string,
  metadata: Record<string, unknown> = {}
) => {
  if (!req.user || !req.user.isAdmin) {
    return;
  }

  try {
    const actorId = new Types.ObjectId(req.user._id.toString());
    const resolvedEntityId = entityId ? new Types.ObjectId(entityId.toString()) : null;

    await AdminAction.create({
      actor: actorId,
      action,
      entityType,
      entityId: resolvedEntityId,
      details,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
