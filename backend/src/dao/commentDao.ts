import mongoose from "mongoose";
import Comment from "../models/commentModel";
import { returnedUser } from "./userDao";
import Post from "../models/postModel";

type returnedComment = {
  id: string;
  content: string;
  user: returnedUser;
};

class CommentDao {
  async createComment(
    userId: string,
    content: string,
    postId: string
  ): Promise<returnedComment> {
    try {
      const newComment = new Comment({
        content,
        user: new mongoose.Types.ObjectId(userId),
        post: new mongoose.Types.ObjectId(postId),
      });

      const savedComment = await newComment.save();

      const post = await Post.findById(postId);

      post?.comments.push(savedComment._id);

      await post?.save();

      await savedComment.populate("user", "id email username image");

      return {
        id: savedComment._id.toString(),
        content: savedComment.content,
        user: {
          id: savedComment.user._id,
          email: savedComment.user.email,
          username: savedComment.user.username,
          image: savedComment.user.image,
        },
      };
    } catch (error) {
      throw new Error("Error creating comment");
    }
  }

  async getCommentsByPost(
    page: number,
    limit: number,
    postId: any
  ): Promise<returnedComment[]> {
    try {
      const skip = (page - 1) * limit;

      const comments = await Comment.find({ post: postId })
        .skip(skip)
        .limit(limit)
        .populate("user", "id email username image")
        .exec();

      const parsedComments = comments.map((comment) => {
        return {
          id: comment._id.toString(),
          content: comment.content,
          user: {
            id: comment.user._id,
            email: comment.user.email,
            username: comment.user.username,
            image: comment.user.image,
          },
        };
      });

      return parsedComments;
    } catch (error) {
      throw new Error("Error getting comments");
    }
  }
}

export default new CommentDao();
