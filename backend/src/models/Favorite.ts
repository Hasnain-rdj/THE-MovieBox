import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  tmdbMovieId: number;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tmdbMovieId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorite entries for the same user and movie
FavoriteSchema.index({ userId: 1, tmdbMovieId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
