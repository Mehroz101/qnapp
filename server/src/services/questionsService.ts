import { Question, IQuestion } from '../models/Question';

interface ListParams {
  search?: string;
  categories?: string[];
  sortBy?: string;
}

export interface IQuestionsService {
  list(params: ListParams): Promise<IQuestion[]>;
  add(data: Partial<IQuestion>): Promise<IQuestion>;
  upvote(id: string, userId: string): Promise<{ votes: number } | null>;
  downvote(id: string, userId: string): Promise<{ votes: number } | null>;
  bookmark(id: string, userId: string): Promise<{ bookmarked: boolean } | null>;
}

export const questionsService: IQuestionsService = {
  async list({ search, categories, sortBy }: ListParams) {
    let query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (categories && Array.isArray(categories)) {
      query.category = { $in: categories };
    }
    let sort: Record<string, any> = { timestamp: -1 };
    if (sortBy === 'votes') sort = { votes: -1 };
    if (sortBy === 'company') sort = { company: 1 };
    return await Question.find(query).sort(sort).exec();
  },
  async add(data: Partial<IQuestion>) {
    if (typeof data.votes !== 'number') data.votes = 0;
    if (typeof data.views !== 'number') data.views = 0;
    if (typeof data.bookmarked !== 'boolean') data.bookmarked = false;
    data.timestamp ??= new Date();
    return await Question.create(data);
  },
  async upvote(id: string, _userId: string) {
    const q = await Question.findById(id).exec();
    if (!q) return null;
    q.votes += 1;
    await q.save();
    return { votes: q.votes };
  },
  async downvote(id: string, _userId: string) {
    const q = await Question.findById(id).exec();
    if (!q) return null;
    q.votes -= 1;
    await q.save();
    return { votes: q.votes };
  },
  async bookmark(id: string, _userId: string) {
    const q = await Question.findById(id).exec();
    if (!q) return null;
    q.bookmarked = !q.bookmarked;
    await q.save();
    return { bookmarked: q.bookmarked };
  },
};
