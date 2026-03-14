import bcrypt from "bcrypt";
import { Request, Response } from "express";
import userDao from "../dao/userDao";
import User, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import {
  getToken,
  getJWTexpire,
  getRefreshToken,
  getRefreshTokenexpire,
  BASE_URL,
} from "../const/config";

export const createUser = async (req: Request, res: Response) => {
  try {
    const image = req.file ? `${BASE_URL}/media/${req.file.filename}` : "";
    const newUser = await userDao.createUser({ ...req.body, image });

    const accessToken = jwt.sign(
      { _id: newUser.id, username: newUser.username, email: newUser.email },
      getToken(),
      { expiresIn: getJWTexpire() }
    );

    const refreshToken = jwt.sign(
      { _id: newUser.id, username: newUser.username, email: newUser.email },
      getRefreshToken(),
      { expiresIn: getRefreshTokenexpire() }
    );

    await userDao.updateUserById(newUser.id, { tokens: [refreshToken] });

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
  } catch (error) {
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
};

export const getUser = async (req: any, res: Response) => {
  try {
    const user = await userDao.getUserById(req.params.userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const image = req.file
      ? `${BASE_URL}/media/${req.file.filename}`
      : req.body.image;

    const currentUserId =
      Array.isArray(req.params.currentUserId)
        ? req.params.currentUserId[0]
        : req.params.currentUserId;

    const updatedUser = await userDao.updateUserById(currentUserId, {
      ...req.body,
      image,
    });
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "MongoServerError") {
        if (error.message.includes("username")) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      getToken(),
      { expiresIn: getJWTexpire() }
    );

    const refreshToken = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      getRefreshToken(),
      { expiresIn: getRefreshTokenexpire() }
    );

    if (user.tokens == null) user.tokens = [refreshToken];
    else user.tokens.push(refreshToken);

    await user.save();

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(accessToken, getToken()) as { _id: string };

    const user = await User.findById(decoded._id);

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
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, getRefreshToken()) as IUser;

    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).json({ message: "Invalid request" });
    }

    if (!user.tokens?.includes(refreshToken)) {
      user.tokens = [""];
      await user.save();
      return res.status(401).json({ message: "Invalid req" });
    }

    user.tokens.splice(user.tokens.indexOf(refreshToken), 1);
    await user.save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, getRefreshToken()) as IUser;

    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).json({ message: "Invalid request" });
    }

    if (!user.tokens?.includes(refreshToken)) {
      user.tokens = [""];
      await user.save();
      return res.status(401).json({ message: "Invalid req" });
    }

    const accessToken = jwt.sign(
      { _id: decoded._id, username: decoded.username, email: decoded.email },
      getToken(),
      { expiresIn: getJWTexpire() }
    );

    const newRefreshToken = jwt.sign(
      { _id: decoded._id, username: decoded.username, email: decoded.email },
      getRefreshToken(),
      { expiresIn: getJWTexpire() }
    );

    user.tokens[user.tokens.indexOf(refreshToken)] = newRefreshToken;
    await user.save();

    res.status(200).json({ accessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};
