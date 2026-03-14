/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

import express from "express";
import {
  createPost,
  getPosts,
  toggleLikePost,
  updatePost,
  removePost,
} from "../controllers/postController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";

const router = express.Router();

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
router.post("/", authMiddleware, upload.single("image"), createPost);

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
router.put("/:postId", authMiddleware, upload.single("image"), updatePost);

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
router.delete("/:postId", authMiddleware, removePost);

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
router.post("/like/:postId", authMiddleware, toggleLikePost);

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
router.get("/:userId?", authMiddleware, getPosts);

export default router;
