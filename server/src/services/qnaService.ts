import { Question } from '../models/Question';
import { User } from '../models/User';

export const qnaService = {
  async createQuestion(data: any) {
    return await (Question as any).create(data);
  },
  async listQuestions() {
    return await (Question as any).find().sort({ createdAt: -1 }).limit(100);
  },
  async getQuestionDetail(id: string) {
    return await (Question as any).findById(id);
  },
  async updateQuestion(id: string, userId: string, body: any) {
    const q = await (Question as any).findOne({ _id: id, author: userId });
    if (!q) return null;
    if (body.title) q.title = body.title;
    if (body.description) q.description = body.description;
    if (body.tags) q.tags = body.tags;
    await q.save();
    return q;
  },
  async deleteQuestion(id: string, userId: string) {
    return await (Question as any).findOneAndDelete({ _id: id, author: userId });
  },
  async answerQuestion(id: string, userId: string, text: string) {
    const q = await (Question as any).findById(id);
    if (!q) return null;
    q.answers.push({ author: userId as any, text, createdAt: new Date() });
    await q.save();
    return q;
  },
  async upvote(id: string, userId: string) {
    const q = await (Question as any).findById(id);
    if (!q) return null;
    const user = await (User as any).findById(userId);
    if (!user) return null;
    const qidStr = q._id.toString();
    const upvotedIds = user.upvoted.map((id: any) => id.toString());
    const downvotedIds = user.downvoted.map((id: any) => id.toString());
    const alreadyUp = upvotedIds.includes(qidStr);
    const alreadyDown = downvotedIds.includes(qidStr);
    if (!alreadyUp) {
      user.upvoted.push(q._id);
      q.upvotes += 1;
    }
    if (alreadyDown) {
      user.downvoted = user.downvoted.filter((id: any) => id.toString() !== qidStr);
      q.downvotes = Math.max(0, q.downvotes - 1);
    }
    await Promise.all([user.save(), q.save()]);
    return { upvotes: q.upvotes, downvotes: q.downvotes };
  },
  async downvote(id: string, userId: string) {
    const q = await (Question as any).findById(id);
    if (!q) return null;
    const user = await (User as any).findById(userId);
    if (!user) return null;
    const qidStr = q._id.toString();
    const downvotedIds = user.downvoted.map((id: any) => id.toString());
    const upvotedIds = user.upvoted.map((id: any) => id.toString());
    const alreadyDown = downvotedIds.includes(qidStr);
    const alreadyUp = upvotedIds.includes(qidStr);
    if (!alreadyDown) {
      user.downvoted.push(q._id);
      q.downvotes += 1;
    }
    if (alreadyUp) {
      user.upvoted = user.upvoted.filter((id: any) => id.toString() !== qidStr);
      q.upvotes = Math.max(0, q.upvotes - 1);
    }
    await Promise.all([user.save(), q.save()]);
    return { upvotes: q.upvotes, downvotes: q.downvotes };
  },
  async bookmark(id: string, userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) return null;
    const qid = id;
    const bookmarkIds = user.bookmarks.map((id: any) => id.toString());
    const has = bookmarkIds.includes(String(qid));
    if (has) {
      user.bookmarks = user.bookmarks.filter((id: any) => id.toString() !== String(qid));
    } else {
      user.bookmarks.push(qid);
    }
    await user.save();
    return { bookmarks: user.bookmarks };
  },
  async myQuestions(userId: string) {
    return await (Question as any).find({ author: userId }).sort({ createdAt: -1 });
  },
  async myUpvoted(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) return [];
    return await (Question as any).find({ _id: { $in: user.upvoted } });
  },
  async myDownvoted(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) return [];
    return await (Question as any).find({ _id: { $in: user.downvoted } });
  },
  async myBookmarks(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) return [];
    return await (Question as any).find({ _id: { $in: user.bookmarks } });
  }
};
