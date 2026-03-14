/**
 * @swagger
 * tags:
 *   name: Content
 *   description: The Content API
 */

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { generateContent } from "../controllers/contentController";

const router = express.Router();

/**
 * @swagger
 * /content/generate:
 *   post:
 *     summary: Generate new content based on type and openai
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contentType:
 *                 type: string
 *                 description: The content to generate
 *             required:
 *               - contentType
 *             example:
 *               contentType: "Tell a funny short joke."
 *     responses:
 *       201:
 *         description: Successfully generated content
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The generated content
 *               example: "Why did the scarecrow win an award? Because he was outstanding in his field!"
 *       500:
 *         description: Server error
 */
router.post("/generate", authMiddleware, generateContent);

export default router;
