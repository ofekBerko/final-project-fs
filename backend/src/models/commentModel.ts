import mongoose, { Schema, model } from "mongoose";
import { IUser } from "./userModel";
import { IPost } from "./postModel";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  user: IUser;
  post: IPost;
}

const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = model<IComment>("Comment", CommentSchema);

export default Comment;
