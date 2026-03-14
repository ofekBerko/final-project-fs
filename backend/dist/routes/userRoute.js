"use strict";
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The Users API
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - username
 *               - password
 *             example:
 *               email: "bob@gmail.com"
 *               username: "bob cohen"
 *               password: "secret password"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/returnedUser'
 *       400:
 *         description: Username or email already taken
 *       500:
 *         description: An unexpected error occurred
 */
router.post("/", upload_1.upload.single("image"), userController_1.createUser);
/**
 * @swagger
 * /users/{userId}:
 *    get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to get
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/returnedUser'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId", authMiddleware_1.authMiddleware, userController_1.getUser);
/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               image:
 *                 type: string
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               username: "moshe moshe"
 *               image: "http://localhost:3000/moshe.png"
 *               tokens: ["token1", "token2"]
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/returnedUser'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/:userId", authMiddleware_1.authMiddleware, upload_1.upload.single("image"), userController_1.updateUser);
/**
 * @swagger
 * /users/loginUser:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/returnedUser'
 *       401:
 *         description: Invalid username or password
 */
router.post("/loginUser", userController_1.loginUser);
/**
 * @swagger
 * /users/logoutUser:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *        description: Invalid req
 *       403:
 *        description: Invalid or expired token.
 */
router.post("/logoutUser", userController_1.logoutUser);
/**
 * @swagger
 * /users/validate-token:
 *   post:
 *     summary: Validate user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 accessToken: string
 *     responses:
 *       200:
 *         description: Token is valid and user is found
 *       401:
 *        description: Access token is required
 *       404:
 *        description: User not found
 *       403:
 *        description: Invalid or expired access token
 */
router.post("/validate-token", userController_1.validateToken);
/**
 * @swagger
 * /users/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     description: Provide the refresh token in the Authorization header.
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Access denied. No token provided.
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post("/refreshToken", userController_1.refreshToken);
exports.default = router;
