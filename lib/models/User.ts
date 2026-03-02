import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  height?: number; // in cm
  weight?: number; // in kg
  dailyCaloricGoal?: number;
  weightTarget?: 'loss' | 'gain' | 'maintain';
  targetWeight?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      default: undefined,
    },
    weight: {
      type: Number,
      default: undefined,
    },
    dailyCaloricGoal: {
      type: Number,
      default: 2000,
    },
    weightTarget: {
      type: String,
      enum: ['loss', 'gain', 'maintain'],
      default: 'maintain',
    },
    targetWeight: {
      type: Number,
      default: undefined,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
