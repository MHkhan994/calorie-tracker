import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailySummary extends Document {
  userId: Types.ObjectId;
  date: Date;
  totalCalories: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(new Date().toDateString()),
    },
    totalCalories: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    itemCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for common queries
DailySummarySchema.index({ userId: 1, date: -1 });

export const DailySummary = mongoose.models.DailySummary || mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);
