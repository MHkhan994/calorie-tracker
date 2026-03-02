import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFoodItem extends Document {
  userId: Types.ObjectId;
  date: Date;
  category: 'solid_food' | 'drink' | 'dessert' | 'snack' | 'other';
  name: string;
  amount: number;
  unit: string; // g, ml, pieces, etc.
  caloriesCalculated?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>(
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
    category: {
      type: String,
      enum: ['solid_food', 'drink', 'dessert', 'snack', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    caloriesCalculated: {
      type: Number,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Index for common queries
FoodItemSchema.index({ userId: 1, date: 1 });
FoodItemSchema.index({ userId: 1, createdAt: -1 });

export const FoodItem = mongoose.models.FoodItem || mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
