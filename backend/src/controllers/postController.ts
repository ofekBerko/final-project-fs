import { Request, Response } from "express";
import postDao from "../dao/postDao";
import { BASE_URL } from "../const/config";

export const createPost = async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    const image = req.file ? `${BASE_URL}/media/${req.file.filename}` : "";
    const userId = req.params.currentUserId;

    const newPost = await postDao.createPost(userId, content, image);

    return res.status(201).json(newPost);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updatePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const image = req.file
      ? `${BASE_URL}/media/${req.file.filename}`
      : req.body.image;

    const updatedPost = await postDao.editPost(postId, { ...req.body, image });
    return res.status(200).json(updatedPost);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const removePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await postDao.deletePost(postId);
    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const toggleLikePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.params.currentUserId;

    const result = await postDao.likePost(postId, currentUserId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getPosts = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = req.params.currentUserId;

    const { userId: filterUserId } = req.params;

    if (filterUserId) {
      const posts = await postDao.fetchPostsByUserWithPagination(
        filterUserId,
        currentUserId,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(posts);
    }

    const posts = await postDao.fetchPostsWithPagination(
      Number(page),
      Number(limit),
      currentUserId
    );
    return res.status(200).json(posts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
