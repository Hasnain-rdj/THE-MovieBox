import mongoose, { Schema, Document } from 'mongoose';

export interface IMovieCache extends Document {
  movieId: number;
  title: string;
  type: 'movie' | 'series';
  overview: string;
  rating: number;
  voteCount: number;
  releaseDate: string;
  poster: string | null;
  backdrop: string | null;
  genres: string[];
  actors: { id: number; name: string; character: string; profilePath: string | null }[];
  trailerKey: string | null;
  trailerUrl: string | null;
  source: 'TMDB' | 'OMDB' | 'WEB_SCRAPED' | 'CACHE';
  lastSyncedAt: Date;
}

const MovieCacheSchema: Schema = new Schema(
  {
    movieId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['movie', 'series'],
      default: 'movie',
    },
    overview: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    releaseDate: {
      type: String,
      default: '',
    },
    poster: {
      type: String,
      default: null,
    },
    backdrop: {
      type: String,
      default: null,
    },
    genres: {
      type: [String],
      default: [],
    },
    actors: [
      {
        id: Number,
        name: String,
        character: String,
        profilePath: String,
      },
    ],
    trailerKey: {
      type: String,
      default: null,
    },
    trailerUrl: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      enum: ['TMDB', 'OMDB', 'WEB_SCRAPED', 'CACHE'],
      default: 'TMDB',
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMovieCache>('MovieCache', MovieCacheSchema);
