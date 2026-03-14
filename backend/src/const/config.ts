import dotenv from "dotenv";

dotenv.config();

export const CLIENT_URL = process.env.CLIENT_URL || "";
export const PORT = 80;
export const BASE_URL = process.env.BASE_URL || "";
export const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/local";

export const getToken = () => {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET is missing from environment variables");
  }

  return process.env.TOKEN_SECRET;
};

export const getJWTexpire = () => {
  if (!process.env.TOKEN_EXPIRES) {
    throw new Error("TOKEN_EXPIRES is missing from environment variables");
  }

  return Number(process.env.TOKEN_EXPIRES) || "1h";
};

export const getRefreshTokenexpire = () => {
  if (!process.env.REFRESH_TOKEN_EXPIRES) {
    throw new Error(
      "REFRESH_TOKEN_EXPIRES is missing from environment variables",
    );
  }

  return Number(process.env.REFRESH_TOKEN_EXPIRES) || "7d";
};

export const getRefreshToken = () => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error(
      "REFRESH_TOKEN_SECRET is missing from environment variables",
    );
  }

  return process.env.REFRESH_TOKEN_SECRET;
};
