import mongoose from "mongoose";
import Post, { IPost } from "../models/postModel";
import { returnedUser } from "./userDao";

type updateDao = {
  content?: IPost["content"];
  image?: IPost["image"];
};

type returnedPost = {
  id: string;
  image: string;
  content: string;
  likes: number;
  user: returnedUser;
  isUserLiked?: boolean;
  commentsCount?: number;
};

class PostDao {
  async createPost(
    userId: string,
    content: string,
    image: string
  ): Promise<returnedPost> {
    try {
      const newPost = new Post({
        image,
        content,
        likes: [],
        comments: [],
        user: new mongoose.Types.ObjectId(userId),
      });

      const savedPost = await newPost.save();
      await savedPost.populate("user", "id email username image");

      return {
        id: savedPost._id.toString(),
        image: savedPost.image,
        content: savedPost.content,
        likes: savedPost.likes.length,
        commentsCount: savedPost.comments.length,
        user: {
          id: savedPost.user._id,
          email: savedPost.user.email,
          username: savedPost.user.username,
          image: savedPost.user.image,
        },
      };
    } catch (error) {
      throw new Error("Error creating post");
    }
  }

  async editPost(
    postId: string,
    updatedData: updateDao
  ): Promise<returnedPost | null> {
    const newPost = await Post.findOneAndUpdate({ _id: postId }, updatedData, {
      new: true,
    });

    if (!newPost) throw new Error("Post not found");

    await newPost.populate("user", "id email username image");

    return {
      id: newPost._id.toString(),
      image: newPost.image,
      content: newPost.content,
      likes: newPost.likes.length,
      commentsCount: newPost.comments.length,
      user: {
        id: newPost.user._id,
        email: newPost.user.email,
        username: newPost.user.username,
        image: newPost.user.image,
      },
    };
  }

  async deletePost(postId: string) {
    const post = await Post.findById(postId);

    if (!post) throw new Error("Post not found");

    await Post.deleteOne({ _id: postId });

    return true;
  }

  async likePost(postId: string, userId: string) {
    const post = await Post.findById(postId);

    if (!post) throw new Error("Post not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (post.likes.includes(userObjectId)) {
      post.likes = post.likes.filter((like) => !like.equals(userObjectId));
      await post.save();
      return { isUserLiked: false };
    } else {
      post.likes.push(userObjectId);
      await post.save();
      return { isUserLiked: true };
    }
  }

  async fetchPostsWithPagination(
    page: number,
    limit: number,
    userId: string
  ): Promise<returnedPost[]> {
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .populate("user", "id email username image")
      .exec();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const postsWithLikes = posts.map((post) => {
      const isUserLiked = post.likes.includes(userObjectId);
      return {
        id: post._id.toString(),
        image: post.image,
        content: post.content,
        likes: post.likes.length,
        commentsCount: post.comments.length,
        user: {
          id: post.user._id,
          email: post.user.email,
          username: post.user.username,
          image: post.user.image,
        },
        isUserLiked,
      };
    });

    return postsWithLikes;
  }

  async fetchPostsByUserWithPagination(
    filterUserId: string,
    currentUserId: string,
    page: number,
    limit: number
  ): Promise<returnedPost[]> {
    const skip = (page - 1) * limit;

    const filterUserObjectId : any = new mongoose.Types.ObjectId(filterUserId);
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const posts = await Post.find({ user: filterUserObjectId })
      .skip(skip)
      .limit(limit)
      .populate("user", "id email username image")
      .exec();

    const postsWithLikes = posts.map((post) => {
      const isUserLiked = post.likes.includes(currentUserObjectId);
      return {
        id: post._id.toString(),
        image: post.image,
        content: post.content,
        likes: post.likes.length,
        commentsCount: post.comments.length,
        user: {
          id: post.user._id,
          email: post.user.email,
          username: post.user.username,
          image: post.user.image,
        },
        isUserLiked,
      };
    });

    return postsWithLikes;
  }
}

export default new PostDao();
