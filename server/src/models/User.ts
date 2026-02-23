import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  iitgEmail: string;
  personalEmail: string;
  password: string;
  name: string;
  rollNumber: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isVerified: boolean;
  verificationCode?: string; // New field for numeric verification code
  verificationCodeExpires?: Date; // New field for code expiry
}

const UserSchema = new Schema<IUser>({
  iitgEmail: {
    type: String,
    required: [true, 'IITG email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@iitgn\.ac\.in$/, 'Please fill a valid IIT Gandhinagar email address']
  },
  personalEmail: {
    type: String,
    required: [true, 'Personal email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid personal email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: { // New field
    type: String,
  },
  verificationCodeExpires: { // New field
    type: Date,
  }
}, {
  timestamps: true
});

export default model<IUser>('User', UserSchema);
