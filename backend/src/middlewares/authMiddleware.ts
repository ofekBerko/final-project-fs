import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getToken } from "../const/config";
import { IUser } from "../models/userModel";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");

  const token = authorization && authorization.split(" ")[1];

  if (token === undefined) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, getToken()) as IUser;
    req.params.currentUserId = decoded._id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
