"use strict";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Auth API
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
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
router.post("/google", authController_1.handleGoogleAuth);
exports.default = router;
