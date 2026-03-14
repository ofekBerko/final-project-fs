"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshToken = exports.getRefreshTokenexpire = exports.getJWTexpire = exports.getToken = exports.mongoURI = exports.BASE_URL = exports.PORT = exports.CLIENT_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CLIENT_URL = process.env.CLIENT_URL || "";
exports.PORT = process.env.PORT || 3000;
exports.BASE_URL = process.env.BASE_URL || "";
exports.mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/local";
const getToken = () => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is missing from environment variables");
    }
    return process.env.TOKEN_SECRET;
};
exports.getToken = getToken;
const getJWTexpire = () => {
    if (!process.env.TOKEN_EXPIRES) {
        throw new Error("TOKEN_EXPIRES is missing from environment variables");
    }
    return Number(process.env.TOKEN_EXPIRES) || "1h";
};
exports.getJWTexpire = getJWTexpire;
const getRefreshTokenexpire = () => {
    if (!process.env.REFRESH_TOKEN_EXPIRES) {
        throw new Error("REFRESH_TOKEN_EXPIRES is missing from environment variables");
    }
    return Number(process.env.REFRESH_TOKEN_EXPIRES) || "7d";
};
exports.getRefreshTokenexpire = getRefreshTokenexpire;
const getRefreshToken = () => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is missing from environment variables");
    }
    return process.env.REFRESH_TOKEN_SECRET;
};
exports.getRefreshToken = getRefreshToken;
