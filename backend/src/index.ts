import { CLIENT_URL, mongoURI, PORT } from "./const/config";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoute";
import authRoutes from "./routes/authRoute";
import postRoutes from "./routes/postRoute";
import commentRoutes from "./routes/commentRoute";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import contentRoute from "./routes/contentRoute";
import https from "https";
import fs from "fs";
import path from "path";

const app = express();
let server: http.Server;

if (process.env.NODE_ENV !== "production") {
  console.log("development mode - using HTTP");
  server = http.createServer(app);
} else {
  console.log("production mode - using HTTPS");
  const options = {
    key: fs.readFileSync("../client-key.pem"),
    cert: fs.readFileSync("../client-cert.pem"),
  };
  server = https.createServer(options, app);
}

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:
      "Content-Type, Authorization, Cross-Origin-Opener-Policy, same-origin-allow-popups",
    credentials: true,
  }),
);

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/content", contentRoute);
app.use("/api/media/", express.static("media"));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "full stack REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      { url: "http://localhost:3000/api" },
      { url: "https://node23.cs.colman.ac.il/api" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/swaggerDef.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(express.static("frontend"));

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { server };
