import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  author: mongoose.Types.ObjectId;
  text: string; // may include (code here) markers which frontend will render
  createdAt: Date;
}

export interface IQuestion extends Document {
  author: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  company: string;
  interviewType: 'technical' | 'behavioral' | 'system-design' | 'coding' | 'case-study';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  views: number;
  bookmarked: boolean;
  timestamp: Date;
  votes: number;
}

const AnswerSchema = new Schema<IAnswer>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema<IQuestion>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  company: { type: String, required: true },
  interviewType: { type: String, enum: ['technical', 'behavioral', 'system-design', 'coding', 'case-study'], required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  views: { type: Number, default: 0 },
  bookmarked: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
}, { timestamps: true });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);


