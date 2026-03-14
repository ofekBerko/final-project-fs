"use strict";
/**
 * @swagger
 * tags:
 *   name: Content
 *   description: The Content API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const contentController_1 = require("../controllers/contentController");
const router = express_1.default.Router();
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
router.post("/generate", authMiddleware_1.authMiddleware, contentController_1.generateContent);
exports.default = router;
