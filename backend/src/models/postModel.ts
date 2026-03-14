import mongoose, { Schema, model } from "mongoose";
import { IUser } from "./userModel";

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  image: string;
  content: string;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  user: IUser;
}

const postSchema = new Schema(
  {
    image: { type: String, required: true },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "Posts" }
);

const Post = model<IPost>("Post", postSchema);

export default Post;
