import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  bookmarks: mongoose.Types.ObjectId[]; // question ids
  upvoted: mongoose.Types.ObjectId[]; // question ids
  downvoted: mongoose.Types.ObjectId[]; // question ids
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  upvoted: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  downvoted: [{ type: Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


