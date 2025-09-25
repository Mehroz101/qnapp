import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  author: mongoose.Types.ObjectId;
  text: string; // may include (code here) markers which frontend will render
  createdAt: Date;
}

export interface IQuestion extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  description: string;
  tags: string[];
  answers: IAnswer[];
  upvotes: number;
  downvotes: number;
}

const AnswerSchema = new Schema<IAnswer>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema<IQuestion>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  answers: [AnswerSchema],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 }
}, { timestamps: true });

export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);


