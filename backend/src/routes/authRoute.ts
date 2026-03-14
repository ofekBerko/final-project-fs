/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Auth API
 */

import { Router } from "express";
import { handleGoogleAuth } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login user via google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google auth completed successfully and the user is logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/returnedUser'
 *       500:
 *         description: Server error
 */
router.post("/google", handleGoogleAuth);

export default router;
