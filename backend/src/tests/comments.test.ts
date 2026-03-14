import request from "supertest";
import mongoose from "mongoose";
import postModel from "../models/postModel";
import userModel from "../models/userModel";
import commentModel from "../models/commentModel";
import { mongoURI } from "../const/config";
import { server } from "../index";
import fs from "fs";
import path from "path";

interface IUser {
  email: string;
  password: string;
  username: string;
  _id?: string;
  refreshToken?: string[];
}

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  username: "username",
  password: "testpassword",
};

let postId = "";
const filePath = path.join(__dirname, "test-post-image.jpg");

beforeAll(async () => {
  await mongoose.connect(mongoURI);

  await postModel.deleteMany();
  await userModel.deleteMany();
  await commentModel.deleteMany();

  await request(server).post("/api/users/").send(testUser);
  const res = await request(server).post("/api/users/loginUser").send(testUser);

  testUser.token = res.body.accessToken;
  testUser._id = res.body.user.id;
  expect(testUser.token).toBeDefined();
  fs.writeFileSync(filePath, "dummy content");

  const postResponse = await request(server)
    .post("/api/posts")
    .set("Authorization", `Bearer ${testUser.token}`)
    .attach("image", filePath)
    .field("content", "Test image");

  expect(postResponse.statusCode).toBe(201);
  postId = postResponse.body.id;
});

afterAll(async () => {
  await postModel.deleteMany();
  await userModel.deleteMany();
  await commentModel.deleteMany();

  fs.unlinkSync(filePath);

  await mongoose.connection.close();
  server.close();
});

describe("Comment Tests", () => {
  test("Test Create Comment", async () => {
    const response = await request(server)
      .post("/api/comments")
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        content: "This is a comment on the post",
        postId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe("This is a comment on the post");
    expect(response.body.user.id).toBe(testUser._id);
  });

  test("Test Get Comments by Post", async () => {
    const response = await request(server)
      .get(`/api/comments/${postId}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].content).toBe("This is a comment on the post");
  });

  test("Test Create Comment Fail (No Content)", async () => {
    const response = await request(server)
      .post("/api/comments")
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        postId,
      });

    expect(response.statusCode).toBe(500);
  });

  test("Test Create Comment Fail (Invalid Token)", async () => {
    const response = await request(server)
      .post("/api/comments")
      .set("Authorization", "Bearer invalidToken")
      .send({
        content: "This is a comment with invalid token",
        postId,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token.");
  });

  test("Test Get Comments by Post Fail (Invalid Post ID)", async () => {
    const invalidPostId = "invalidPostId";

    const response = await request(server)
      .get(`/api/comments/${invalidPostId}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Error getting comments");
  });

  test("Test Create Comment Fail (Missing PostId)", async () => {
    const response = await request(server)
      .post("/api/comments")
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        content: "This is a comment without postId",
      });

    expect(response.statusCode).toBe(201);
  });

  test("Test Create Comment Fail (User Not Logged In)", async () => {
    const response = await request(server).post("/api/comments").send({
      content: "This is a comment while not logged in",
      postId,
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Access denied. No token provided.");
  });

  test("Test Create Comment with Long Content", async () => {
    const longContent = "A".repeat(1000);

    const response = await request(server)
      .post("/api/comments")
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        content: longContent,
        postId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe(longContent);
  });

  test("Test Get Comments Paginated", async () => {
    const response = await request(server)
      .get(`/api/comments/${postId}?page=1&limit=2`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeLessThanOrEqual(2);
  });
});
