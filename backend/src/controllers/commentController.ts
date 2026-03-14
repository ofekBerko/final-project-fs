import { Request, Response } from "express";
import commentDao from "../dao/commentDao";

export const createComment = async (req: any, res: Response) => {
  try {
    const { content, postId } = req.body;
    const userId = req.params.currentUserId;

    const newComment = await commentDao.createComment(userId, content, postId);

    return res.status(201).json(newComment);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getComments = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const postId = req.params.postId;

    const comments = await commentDao.getCommentsByPost(
      Number(page),
      Number(limit),
      postId
    );

    return res.status(200).json(comments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
