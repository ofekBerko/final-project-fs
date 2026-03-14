"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../const/config");
const authMiddleware = (req, res, next) => {
    const authorization = req.header("authorization");
    const token = authorization && authorization.split(" ")[1];
    if (token === undefined) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, (0, config_1.getToken)());
        req.params.currentUserId = decoded._id;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};
exports.authMiddleware = authMiddleware;
