import mongoose from "mongoose";
import { Question } from "../models/Question.js";
import { User } from "../models/User.js";
const ObjectId = mongoose.Types.ObjectId;

export const qnaService = {
  async createQuestion(data: any) {
    return await (Question as any).create(data);
  },
// service.ts (or qnaService)
async listQuestions(userId?: string, query: any = {}) {
  const limit = parseInt(query.limit, 10) || 10;
  const cursor = query.cursor;
  const search = query.search;
  const sortBy = query.sortBy || "newest";

  // --- Normalize categories ---
  let categories: string[] = [];
  if (query.categories) {
    categories = Array.isArray(query.categories)
      ? query.categories
      : String(query.categories).split(",");
  } else if (query["categories[]"]) {
    categories = Array.isArray(query["categories[]"])
      ? query["categories[]"]
      : [query["categories[]"]];
  }

  // --- Base filter ---
  const filter: any = {};

  // Cursor-based pagination
  if (cursor) {
    try {
      filter._id = { $lt: new ObjectId(cursor) };
    } catch (e) {
      // ignore invalid cursor
    }
  }

  // Category filter
  if (categories.length > 0) {
    filter.category = { $in: categories };
  }

  // Search filter
  if (search) {
    filter.question = { $regex: search, $options: "i" };
  }

  // --- Sorting ---
  let sort: any = { _id: -1 }; // default newest
  if (sortBy === "votes") {
    sort = { votes: -1 };
  } else if (sortBy === "company") {
    sort = { company: 1 };
  }

  // --- Query DB ---
  const docs = await (Question as any)
    .find(filter)
    .sort(sort)
    .limit(limit + 1)
    .populate("author", "username");

  const hasMore = docs.length > limit;
  const pageItems = docs.slice(0, limit);

  const nextCursor =
    hasMore && pageItems.length > 0
      ? pageItems[pageItems.length - 1]._id.toString()
      : null;

  // --- No userId case ---
  if (!userId) {
    return {
      data: pageItems,
      nextCursor,
      hasMore,
    };
  }

  // --- Enrich with user-specific metadata ---
  const user = await (User as any).findById(userId);
  if (!user) {
    return {
      data: pageItems,
      nextCursor,
      hasMore,
    };
  }

  const enriched = pageItems.map((q: any) => {
    const qid = q._id.toString();
    const myVote = user.upvoted.some((id: any) => id.toString() === qid)
      ? "up"
      : user.downvoted.some((id: any) => id.toString() === qid)
      ? "down"
      : null;

    return {
      ...q.toObject(),
      myVote,
      bookmarked: user.bookmarks.some((id: any) => id.toString() === qid),
    };
  });

  return {
    data: enriched,
    nextCursor,
    hasMore,
  };
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
    return await (Question as any).findOneAndDelete({
      _id: id,
      author: userId,
    });
  },
  async answerQuestion(id: string, userId: string, text: string) {
    const q = await (Question as any).findById(id);
    if (!q) return null;
    q.answers.push({ author: userId as any, text, createdAt: new Date() });
    await q.save();
    return q;
  },
  async upvote(id: string, userId: string) {
    console.log("Upvoting question", id, "by user", userId);
    const q = await (Question as any).findById(id);
    if (!q) {
      return null;
    }
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }
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
      user.downvoted = user.downvoted.filter(
        (x: any) => x.toString() !== qidStr
      );
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
    if (!q) {
      return null;
    }
    const user = await (User as any).findById(userId);
    if (!user) {
      return null;
    }
    const qidStr = q._id.toString();
    const downvotedIds = user.downvoted.map((id: any) => id.toString());
    const upvotedIds = user.upvoted.map((id: any) => id.toString());
    const alreadyDown = downvotedIds.includes(qidStr);
    const alreadyUp = upvotedIds.includes(qidStr);
    if (alreadyDown) {
      // undo downvote
      user.downvoted = user.downvoted.filter(
        (x: any) => x.toString() !== qidStr
      );
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
    if (!user) {
      return null;
    }
    const qid = id;
    const bookmarkIds = user.bookmarks.map((id: any) => id.toString());
    const has = bookmarkIds.includes(String(qid));
    if (has) {
      user.bookmarks = user.bookmarks.filter(
        (id: any) => id.toString() !== String(qid)
      );
    } else {
      user.bookmarks.push(qid);
    }
    await user.save();
    return { bookmarks: user.bookmarks };
  },
  async myQuestions(userId: string) {
    if (!userId) {
      return await (Question as any)
        .find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("author", "username");
    }
    const response = await (Question as any)
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "username");
    const user = await (User as any).findById(userId);
    if (!user) {
      return response;
    }
    return response.map((q: any) => {
      const qidStr = q._id.toString();
      let myVote: "up" | "down" | null;
      if (user.upvoted.map((id: any) => id.toString()).includes(qidStr)) {
        myVote = "up";
      } else if (
        user.downvoted.map((id: any) => id.toString()).includes(qidStr)
      ) {
        myVote = "down";
      } else {
        myVote = null;
      }
      return {
        ...q.toObject(),
        myVote,
        bookmarked: user.bookmarks
          .map((id: any) => id.toString())
          .includes(qidStr),
      };
    });
  },
  async myUpvoted(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) {
      return [];
    }
    return await (Question as any).find({ _id: { $in: user.upvoted } });
  },
  async myDownvoted(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) {
      return [];
    }
    return await (Question as any).find({ _id: { $in: user.downvoted } });
  },
  async myBookmarks(userId: string) {
    const user = await (User as any).findById(userId);
    if (!user) {
      return [];
    }
    return await (Question as any).find({ _id: { $in: user.bookmarks } });
  },
  async viewQuestion({ questionId }: { questionId: string }) {
    try {
      console.log("Viewing question", questionId);
      const q = await (Question as any).findById(questionId);
      if (!q) {
        return null;
      }
      q.views += 1;
      await q.save();
      return q;
    } catch (error) {
      console.error("Error in viewQuestion:", error);
      return null;
    }
  },
  async getCategories() {
    const categories = await (Question as any).find().distinct("category");
    console.log("Categories fetched:", categories);
    return categories;
  },
};
