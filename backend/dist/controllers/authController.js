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
exports.handleGoogleAuth = void 0;
const userDao_1 = __importDefault(require("../dao/userDao"));
const userModel_1 = __importDefault(require("../models/userModel"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../const/config");
const client = new google_auth_library_1.OAuth2Client();
const getTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, (0, config_1.getToken)(), {
        expiresIn: (0, config_1.getJWTexpire)(),
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, (0, config_1.getRefreshToken)(), {
        expiresIn: (0, config_1.getRefreshTokenexpire)(),
    });
    return { accessToken, refreshToken };
};
const handleGoogleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const credential = req.body.credential;
    try {
        const ticket = yield client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload && payload.email) {
            const user = yield userModel_1.default.findOne({ email: payload.email });
            if (user) {
                const { refreshToken, accessToken } = getTokens({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                });
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
            else {
                const newUser = yield userDao_1.default.createUser({
                    email: payload.email,
                    username: payload.name,
                    password: "google_sign",
                    image: payload.picture,
                });
                const { refreshToken, accessToken } = getTokens({
                    _id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                });
                yield userDao_1.default.updateUserById(newUser.id, { tokens: [refreshToken] });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/",
                });
                res.status(200).json({
                    accessToken,
                    user: newUser,
                });
            }
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.handleGoogleAuth = handleGoogleAuth;
