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
exports.getPosts = exports.toggleLikePost = exports.removePost = exports.updatePost = exports.createPost = void 0;
const postDao_1 = __importDefault(require("../dao/postDao"));
const config_1 = require("../const/config");
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const image = req.file ? `${config_1.BASE_URL}/media/${req.file.filename}` : "";
        const userId = req.params.currentUserId;
        const newPost = yield postDao_1.default.createPost(userId, content, image);
        return res.status(201).json(newPost);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createPost = createPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const image = req.file
            ? `${config_1.BASE_URL}/media/${req.file.filename}`
            : req.body.image;
        const updatedPost = yield postDao_1.default.editPost(postId, Object.assign(Object.assign({}, req.body), { image }));
        return res.status(200).json(updatedPost);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.updatePost = updatePost;
const removePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const result = yield postDao_1.default.deletePost(postId);
        return res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.removePost = removePost;
const toggleLikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const currentUserId = req.params.currentUserId;
        const result = yield postDao_1.default.likePost(postId, currentUserId);
        return res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.toggleLikePost = toggleLikePost;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10 } = req.query;
        const currentUserId = req.params.currentUserId;
        const { userId: filterUserId } = req.params;
        if (filterUserId) {
            const posts = yield postDao_1.default.fetchPostsByUserWithPagination(filterUserId, currentUserId, Number(page), Number(limit));
            return res.status(200).json(posts);
        }
        const posts = yield postDao_1.default.fetchPostsWithPagination(Number(page), Number(limit), currentUserId);
        return res.status(200).json(posts);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.getPosts = getPosts;
