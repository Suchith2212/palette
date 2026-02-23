import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for Event document
export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  date: Date; // This will now effectively be the startDate
  endDate?: Date; // New optional field
  location: string;
  type: 'workshop' | 'competition' | 'event';
  imageUrl: string;
  maxParticipants?: number;
  registeredParticipants: mongoose.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Event Schema
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    date: { // This will now effectively be the startDate
      type: Date,
      required: [true, 'Please add a start date'], // Updated message
    },
    endDate: { // New optional field
      type: Date,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify event type'],
      enum: {
        values: ['workshop', 'competition', 'event'],
        message: 'Event type must be workshop, competition, or event',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add an image'],
    },
    maxParticipants: {
      type: Number,
      min: [1, 'Max participants must be at least 1'],
    },
    registeredParticipants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ registeredParticipants: 1 });

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;