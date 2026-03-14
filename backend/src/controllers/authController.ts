import userDao from "../dao/userDao";
import User, { IUser } from "../models/userModel";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { getJWTexpire, getRefreshToken, getRefreshTokenexpire, getToken } from "../const/config";

const client = new OAuth2Client();

type Payload = {
  _id: string;
  username: string;
  email: string;
};

const getTokens = (payload: Payload) => {
  const accessToken = jwt.sign(payload, getToken(), {
    expiresIn: getJWTexpire(),
  });

  const refreshToken = jwt.sign(payload, getRefreshToken(), {
    expiresIn: getRefreshTokenexpire(),
  });
  return { accessToken, refreshToken };
};

export const handleGoogleAuth = async (req: Request, res: Response) => {
  const credential = req.body.credential;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (payload && payload.email) {
      const user = await User.findOne({ email: payload.email });

      if (user) {
        const { refreshToken, accessToken } = getTokens({
          _id: user._id,
          username: user.username,
          email: user.email,
        });

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
      } else {
        const newUser = await userDao.createUser({
          email: payload.email,
          username: payload.name!,
          password: "google_sign",
          image: payload.picture,
        } as IUser);

        const { refreshToken, accessToken } = getTokens({
          _id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        });

        await userDao.updateUserById(newUser.id, { tokens: [refreshToken] });

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
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
