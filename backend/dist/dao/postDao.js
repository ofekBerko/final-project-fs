"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postModel_1 = __importDefault(require("../models/postModel"));
class PostDao {
    createPost(userId, content, image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newPost = new postModel_1.default({
                    image,
                    content,
                    likes: [],
                    comments: [],
                    user: new mongoose_1.default.Types.ObjectId(userId),
                });
                const savedPost = yield newPost.save();
                yield savedPost.populate("user", "id email username image");
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
            }
            catch (error) {
                throw new Error("Error creating post");
            }
        });
    }
    editPost(postId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPost = yield postModel_1.default.findOneAndUpdate({ _id: postId }, updatedData, {
                new: true,
            });
            if (!newPost)
                throw new Error("Post not found");
            yield newPost.populate("user", "id email username image");
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
        });
    }
    deletePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield postModel_1.default.findById(postId);
            if (!post)
                throw new Error("Post not found");
            yield postModel_1.default.deleteOne({ _id: postId });
            return true;
        });
    }
    likePost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield postModel_1.default.findById(postId);
            if (!post)
                throw new Error("Post not found");
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            if (post.likes.includes(userObjectId)) {
                post.likes = post.likes.filter((like) => !like.equals(userObjectId));
                yield post.save();
                return { isUserLiked: false };
            }
            else {
                post.likes.push(userObjectId);
                yield post.save();
                return { isUserLiked: true };
            }
        });
    }
    fetchPostsWithPagination(page, limit, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const posts = yield postModel_1.default.find()
                .skip(skip)
                .limit(limit)
                .populate("user", "id email username image")
                .exec();
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
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
        });
    }
    fetchPostsByUserWithPagination(filterUserId, currentUserId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const filterUserObjectId = new mongoose_1.default.Types.ObjectId(filterUserId);
            const currentUserObjectId = new mongoose_1.default.Types.ObjectId(currentUserId);
            const posts = yield postModel_1.default.find({ user: filterUserObjectId })
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
        });
    }
}
exports.default = new PostDao();
