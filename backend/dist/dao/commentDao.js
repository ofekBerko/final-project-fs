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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
class CommentDao {
    createComment(userId, content, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newComment = new commentModel_1.default({
                    content,
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    post: new mongoose_1.default.Types.ObjectId(postId),
                });
                const savedComment = yield newComment.save();
                const post = yield postModel_1.default.findById(postId);
                post === null || post === void 0 ? void 0 : post.comments.push(savedComment._id);
                yield (post === null || post === void 0 ? void 0 : post.save());
                yield savedComment.populate("user", "id email username image");
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
            }
            catch (error) {
                throw new Error("Error creating comment");
            }
        });
    }
    getCommentsByPost(page, limit, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const comments = yield commentModel_1.default.find({ post: postId })
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
            }
            catch (error) {
                throw new Error("Error getting comments");
            }
        });
    }
}
exports.default = new CommentDao();
