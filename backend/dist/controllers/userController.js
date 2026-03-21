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
exports.refreshToken = exports.logoutUser = exports.validateToken = exports.loginUser = exports.updateUser = exports.getUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userDao_1 = __importDefault(require("../dao/userDao"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../const/config");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = req.file ? `${config_1.BASE_URL}/media/${req.file.filename}` : "";
        const newUser = yield userDao_1.default.createUser(Object.assign(Object.assign({}, req.body), { image }));
        const accessToken = jsonwebtoken_1.default.sign({ _id: newUser.id, username: newUser.username, email: newUser.email }, (0, config_1.getToken)(), { expiresIn: (0, config_1.getJWTexpire)() });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: newUser.id, username: newUser.username, email: newUser.email }, (0, config_1.getRefreshToken)(), { expiresIn: (0, config_1.getRefreshTokenexpire)() });
        yield userDao_1.default.updateUserById(newUser.id, { tokens: [refreshToken] });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.status(201).json({
            accessToken,
            user: newUser,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "MongoServerError") {
                if (error.message.includes("username")) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
                if (error.message.includes("email")) {
                    return res.status(400).json({ message: "Email is already in use" });
                }
            }
        }
        res.status(500).json({ message: "An unexpected error occurred" });
    }
});
exports.createUser = createUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userDao_1.default.getUserById(req.params.userId);
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
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
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const image = req.file
            ? `${config_1.BASE_URL}/media/${req.file.filename}`
            : req.body.image;
        const currentUserId = Array.isArray(req.params.currentUserId)
            ? req.params.currentUserId[0]
            : req.params.currentUserId;
        const updatedUser = yield userDao_1.default.updateUserById(currentUserId, Object.assign(Object.assign({}, req.body), { image }));
        if (updatedUser) {
            res.status(200).json(updatedUser);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "MongoServerError") {
                if (error.message.includes("username")) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
            }
        }
    }
});
exports.updateUser = updateUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield userModel_1.default.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id, username: user.username, email: user.email }, (0, config_1.getToken)(), { expiresIn: (0, config_1.getJWTexpire)() });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id, username: user.username, email: user.email }, (0, config_1.getRefreshToken)(), { expiresIn: (0, config_1.getRefreshTokenexpire)() });
        if (user.tokens == null)
            user.tokens = [refreshToken];
        else
            user.tokens.push(refreshToken);
        yield user.save();
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.status(200).json({
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.loginUser = loginUser;
const validateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken } = req.body;
    if (!accessToken) {
        return res.status(401).json({ message: "Access token is required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, (0, config_1.getToken)());
        const user = yield userModel_1.default.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
            },
        });
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid or expired access token" });
    }
});
exports.validateToken = validateToken;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, (0, config_1.getRefreshToken)());
        const user = yield userModel_1.default.findOne({ _id: decoded._id });
        if (!user) {
            return res.status(401).json({ message: "Invalid request" });
        }
        if (!((_a = user.tokens) === null || _a === void 0 ? void 0 : _a.includes(refreshToken))) {
            user.tokens = [""];
            yield user.save();
            return res.status(401).json({ message: "Invalid req" });
        }
        user.tokens.splice(user.tokens.indexOf(refreshToken), 1);
        yield user.save();
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
});
exports.logoutUser = logoutUser;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, (0, config_1.getRefreshToken)());
        const user = yield userModel_1.default.findOne({ _id: decoded._id });
        if (!user) {
            return res.status(401).json({ message: "Invalid request" });
        }
        if (!((_a = user.tokens) === null || _a === void 0 ? void 0 : _a.includes(refreshToken))) {
            user.tokens = [""];
            yield user.save();
            return res.status(401).json({ message: "Invalid req" });
        }
        const accessToken = jsonwebtoken_1.default.sign({ _id: decoded._id, username: decoded.username, email: decoded.email }, (0, config_1.getToken)(), { expiresIn: (0, config_1.getJWTexpire)() });
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id: decoded._id, username: decoded.username, email: decoded.email }, (0, config_1.getRefreshToken)(), { expiresIn: (0, config_1.getJWTexpire)() });
        user.tokens[user.tokens.indexOf(refreshToken)] = newRefreshToken;
        yield user.save();
        res.status(200).json({ accessToken });
    }
    catch (error) {
        return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
    }
});
exports.refreshToken = refreshToken;
