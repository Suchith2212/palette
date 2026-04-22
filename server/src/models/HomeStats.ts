import { Schema, model, Document } from 'mongoose';

export interface IHomeStats extends Document {
  key: string;
  workshops: number;
  competitions: number;
  artworks: number;
  engaged: number;
  updatedAt: Date;
  createdAt: Date;
}

const HomeStatsSchema = new Schema<IHomeStats>(
  {
    key: {
      type: String,
      default: 'home',
      unique: true,
      trim: true,
    },
    workshops: {
      type: Number,
      default: 25,
      min: 0,
    },
    competitions: {
      type: Number,
      default: 12,
      min: 0,
    },
    artworks: {
      type: Number,
      default: 100,
      min: 0,
    },
    engaged: {
      type: Number,
      default: 600,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IHomeStats>('HomeStats', HomeStatsSchema);
