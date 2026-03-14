import request from "supertest";
import mongoose from "mongoose";
import postModel from "../models/postModel";
import userModel from "../models/userModel";
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

  await request(server).post("/api/users/").send(testUser);
  const res = await request(server).post("/api/users/loginUser").send(testUser);

  testUser.token = res.body.accessToken;
  testUser._id = res.body.user.id;
  fs.writeFileSync(filePath, "dummy content");
  expect(testUser.token).toBeDefined();
});

afterAll(async () => {
  fs.unlinkSync(filePath);
  await postModel.deleteMany();
  await userModel.deleteMany();

  await mongoose.connection.close();
  server.close();
});

describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(server)
      .get("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Get Posts By User With No Posts", async () => {
    const response = await request(server)
      .get(`/api/posts/${testUser._id}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Test Content");

    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe("Test Content");
    expect(response.body.image).toMatch(/media\/\d+\.\w+/);
    postId = response.body.id;
  });

  test("Test get post by user", async () => {
    const response = await request(server)
      .get(`/api/posts/${testUser._id}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe("Test Content");
    expect(response.body[0].image).toMatch(/media\/\d+\.\w+/);
  });

  test("Test Create Post 2", async () => {
    const response = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Test Content 2");

    expect(response.statusCode).toBe(201);
  });

  test("Posts test get all 2", async () => {
    const response = await request(server)
      .get("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete Post", async () => {
    const response = await request(server)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${testUser.token}`);
    expect(response.statusCode).toBe(200);
  });

  test("Test Create Post Fail (Missing Content)", async () => {
    const response = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Error creating post");
  });

  test("Test Create Post fail (Missing Image)", async () => {
    const response = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        content: "Test Content 2",
      });
    expect(response.statusCode).toBe(500);
  });

  test("Test Update Post", async () => {
    const createResponse = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Initial Content");

    expect(createResponse.statusCode).toBe(201);
    const postIdToUpdate = createResponse.body.id;

    const updateResponse = await request(server)
      .put(`/api/posts/${postIdToUpdate}`)
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        content: "Updated Content",
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.content).toBe("Updated Content");
  });

  test("Test Like Post", async () => {
    const createResponse = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Content to Like");

    expect(createResponse.statusCode).toBe(201);
    const postIdToLike = createResponse.body.id;

    const likeResponse = await request(server)
      .post(`/api/posts/like/${postIdToLike}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(likeResponse.statusCode).toBe(200);
    expect(likeResponse.body.isUserLiked).toBe(true);

    const unlikeResponse = await request(server)
      .post(`/api/posts/like/${postIdToLike}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(unlikeResponse.statusCode).toBe(200);
    expect(unlikeResponse.body.isUserLiked).toBe(false);
  });

  test("Test Get Posts Paginated", async () => {
    await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Post 1");
    await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Post 2");

    const response = await request(server)
      .get("/api/posts?page=1&limit=1")
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Test Get Posts By User With Pagination", async () => {
    const response = await request(server)
      .get(`/api/posts/${testUser._id}?page=1&limit=1`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].content).toBe("Test Content 2");
  });

  test("Test Remove Post Fail (Non-existent Post ID)", async () => {
    const nonExistentPostId = "60d5f4d1e4b0f2db7f8d5c72"; // Random non-existent post ID

    const response = await request(server)
      .delete(`/api/posts/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Post not found");
  });

  test("Test Like Post (Already Liked)", async () => {
    const createResponse = await request(server)
      .post("/api/posts")
      .set("Authorization", `Bearer ${testUser.token}`)
      .attach("image", filePath)
      .field("content", "Post to Like");

    const postIdToLike = createResponse.body.id;

    await request(server)
      .post(`/api/posts/like/${postIdToLike}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    const likeResponse = await request(server)
      .post(`/api/posts/like/${postIdToLike}`)
      .set("Authorization", `Bearer ${testUser.token}`);

    expect(likeResponse.statusCode).toBe(200);
    expect(likeResponse.body.isUserLiked).toBe(false);
  });

  test("Test Post Update Fail (Invalid Post ID)", async () => {
    const invalidPostId = "invalidPostId";

    const response = await request(server)
      .put(`/api/posts/${invalidPostId}`)
      .set("Authorization", `Bearer ${testUser.token}`)
      .send({
        content: "Updated Content for invalid post",
      });

    expect(response.statusCode).toBe(500);
  });
});
