"use strict";
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *             required:
 *               - content
 *               - image
 *             example:
 *               content: "Beautiful day at the beach!"
 *               image: "http://localhost:3000/beach.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/returnedPost'
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware_1.authMiddleware, upload_1.upload.single("image"), postController_1.createPost);
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Update an existing post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *             example:
 *               content: "Updated content!"
 *               image: "http://localhost:3000/updated-image.jpg"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/returnedPost'
 *       500:
 *         description: Server error
 */
router.put("/:postId", authMiddleware_1.authMiddleware, upload_1.upload.single("image"), postController_1.updatePost);
/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *        description: Post deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: boolean
 *              description: Is post deleted successfully
 *              example: true
 *       500:
 *         description: Server error
 */
router.delete("/:postId", authMiddleware_1.authMiddleware, postController_1.removePost);
/**
 * @swagger
 * /posts/like/{postId}:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to like/unlike
 *     responses:
 *       200:
 *         description: Like/unlike toggled successfully
 *         content:
 *            schema:
 *              type: object
 *              properties:
 *                isUserLiked:
 *                type: boolean
 *                description: The new value of like field
 *              example:
 *                isUserLiked: true
 *       500:
 *         description: Server error
 */
router.post("/like/:postId", authMiddleware_1.authMiddleware, postController_1.toggleLikePost);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get list of posts
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: filterUserId
 *         description: Optional user ID to filter posts by a specific user.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/returnedPost'
 *       500:
 *         description: Server error
 */
router.get("/:userId?", authMiddleware_1.authMiddleware, postController_1.getPosts);
exports.default = router;
