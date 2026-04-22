import { Schema, model, Document, Types } from 'mongoose';

export interface IAdminAction extends Document {
  actor: Types.ObjectId;
  action: string;
  entityType: 'event' | 'artwork' | 'user' | 'system' | 'exhibition' | 'contact';
  entityId?: Types.ObjectId | null;
  details?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminActionSchema = new Schema<IAdminAction>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['event', 'artwork', 'user', 'system', 'exhibition', 'contact'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
      default: null,
    },
    details: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default model<IAdminAction>('AdminAction', AdminActionSchema);
