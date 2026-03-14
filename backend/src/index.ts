import { PORT } from "./const/config";
import http from "http";
import express from "express";

const app = express();
let server: http.Server;

if (process.env.NODE_ENV !== "production") {
  server = http.createServer(app);
} else {
  server = http.createServer(app);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { server };
