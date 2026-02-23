import { Schema, model, Document } from 'mongoose';

export interface IExhibition extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  credits: string;
  imageUrl: string;
}

const exhibitionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  credits: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

export default model<IExhibition>('Exhibition', exhibitionSchema);
