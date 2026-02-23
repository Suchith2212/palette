import { Schema, model, Document } from 'mongoose';

export interface IArtwork extends Document {
  title: string;
  description?: string;
  credits: string; // Add credits to the interface
  imageUrl: string;
  artist: Schema.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  score?: number;
}

const ArtworkSchema = new Schema<IArtwork>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  credits: { // New field for artwork credits
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

export default model<IArtwork>('Artwork', ArtworkSchema);