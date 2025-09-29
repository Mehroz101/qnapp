import { Request } from 'express';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';

export const qnaService = {
  async createQuestion(data: any) {
    return await (Question as any).create(data);
  },
  async listQuestions(userId?: string) {
    if (!userId) {
      return await (Question as any).find().sort({ createdAt: -1 }).limit(100);
    }
    const response = await (Question as any).find().sort({ createdAt: -1 }).limit(100);
    const user = await (User as any).findById(userId);
    if (!user) { return response; }
    return response.map((q: any) => {
      const qidStr = q._id.toString();
      let myVote: 'up' | 'down' | null;
      if (user.upvoted.map((id: any) => id.toString()).includes(qidStr)) {
        myVote = 'up';
      } else if (user.downvoted.map((id: any) => id.toString()).includes(qidStr)) {
        myVote = 'down';
      } else {
        myVote = null;
      }
      return {
        ...q.toObject(),
        myVote,
        bookmarked: user.bookmarks.map((id: any) => id.toString()).includes(qidStr),
      };
    });
  },
  async getQuestionDetail(id: string) {
    return await (Question as any).findById(id);
  },
  async updateQuestion(id: string, userId: string, body: any) {
    const q = await (Question as any).findOne({ _id: id, author: userId });
    if (!q) return null;
    Object.assign(q, body);
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
    console.log('Upvoting question', id, 'by user', userId);
    const q = await (Question as any).findById(id);
    if (!q) { return null; }
    const user = await User.findById(userId);
    if (!user) { return null; }
    const qidStr = q._id.toString();
    const upvotedIds = user.upvoted.map((id: any) => id.toString());
    const downvotedIds = user.downvoted.map((id: any) => id.toString());
    const alreadyUp = upvotedIds.includes(qidStr);
    const alreadyDown = downvotedIds.includes(qidStr);
    if (alreadyUp) {
      // undo upvote
      user.upvoted = user.upvoted.filter((x: any) => x.toString() !== qidStr);
      q.votes -= 1;
    } else if (alreadyDown) {
      // 1st click after a downvote: just cancel the downvote (neutralize)
      user.downvoted = user.downvoted.filter((x: any) => x.toString() !== qidStr);
      q.votes += 1;
    } else {
      // brand new upvote
      user.upvoted.push(q._id);
      q.votes += 1;
    }

    await Promise.all([user.save(), q.save()]);
    return { votes: q.votes };
  },
  async downvote(id: string, userId: string) {
    const q = await (Question as any).findById(id);
    if (!q) { return null; }
    const user = await (User as any).findById(userId);
    if (!user) { return null; }
    const qidStr = q._id.toString();
    const downvotedIds = user.downvoted.map((id: any) => id.toString());
    const upvotedIds = user.upvoted.map((id: any) => id.toString());
    const alreadyDown = downvotedIds.includes(qidStr);
    const alreadyUp = upvotedIds.includes(qidStr);
    if (alreadyDown) {
      // undo downvote
      user.downvoted = user.downvoted.filter((x: any) => x.toString() !== qidStr);
      q.votes += 1;
    } else if (alreadyUp) {
      // 1st click after an upvote: just cancel the upvote (neutralize)
      user.upvoted = user.upvoted.filter((x: any) => x.toString() !== qidStr);
      q.votes -= 1;
    } else {
      // brand new downvote
      user.downvoted.push(q._id);
      q.votes -= 1;
    }
    await Promise.all([user.save(), q.save()]);
    return { votes: q.votes };
  },
  async bookmark(id: string, userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) { return null; }
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
    if (!user) { return []; }
    return await (Question as any).find({ _id: { $in: user.upvoted } });
  },
  async myDownvoted(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) { return []; }
    return await (Question as any).find({ _id: { $in: user.downvoted } });
  },
  async myBookmarks(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) { return []; }
    return await (Question as any).find({ _id: { $in: user.bookmarks } });
  }
};
