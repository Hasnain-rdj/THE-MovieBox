import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  tmdbMovieId: number;
  title?: string;
  poster?: string;
  rating?: number;
  releaseDate?: string;
  overview?: string;
  mediaType?: string;
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
    title: { type: String },
    poster: { type: String },
    rating: { type: Number },
    releaseDate: { type: String },
    overview: { type: String },
    mediaType: { type: String, default: 'movie' },
  },
  {
    timestamps: true,
  }
);

FavoriteSchema.index({ userId: 1, tmdbMovieId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
