import request from "supertest";
import mongoose from "mongoose";
import { server } from "../index";
import userModel from "../models/userModel";
import { mongoURI } from "../const/config";

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
  username: "testuser",
  password: "testpassword",
};

let userId = "";
let authToken = "";
let refreshToken: string | undefined = "";

beforeAll(async () => {
  await mongoose.connect(mongoURI);

  if (!server.listening) {
    server.listen(3000);
  }

  await userModel.deleteMany();

  const createUserResponse = await request(server)
    .post("/api/users")
    .send(testUser);

  userId = createUserResponse.body.user.id;

  const loginResponse = await request(server)
    .post("/api/users/loginUser")
    .send({
      username: testUser.username,
      password: testUser.password,
    });
  authToken = loginResponse.body.accessToken;

  expect(authToken).toBeDefined();
});

afterAll(async () => {
  await userModel.deleteMany();

  await mongoose.connection.close();
  server.close();
});

describe("User Routes Tests", () => {
  test("Create User", async () => {
    const response = await request(server).post("/api/users").send({
      email: "newuser@test.com",
      username: "newuser",
      password: "newpassword",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.email).toBe("newuser@test.com");
    expect(response.body.user.username).toBe("newuser");

    refreshToken = (response.headers["set-cookie"] as unknown as string[])
      .find((cookie: string) => cookie.startsWith("refreshToken"))
      ?.split(";")[0]
      ?.split("=")[1];

    expect(refreshToken).toBeDefined();
  });

  test("Create User with Existing Username", async () => {
    const response = await request(server).post("/api/users").send({
      email: "anotheruser@test.com",
      username: "newuser", // This username already exists from the previous test
      password: "anotherpassword",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Username is already taken");
  });

  test("Create User with Existing Email", async () => {
    const response = await request(server).post("/api/users").send({
      email: "newuser@test.com", // This email already exists from the previous test
      username: "anothernewuser",
      password: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Email is already in use");
  });

  test("Get User by ID", async () => {
    const response = await request(server)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.email).toBe(testUser.email);
    expect(response.body.username).toBe(testUser.username);
  });

  test("Get User (User Not Found)", async () => {
    const invalidUserId = "60d5f4d1e4b0f2db7f8d5c73"; // Random non-existent user ID

    const response = await request(server)
      .get(`/api/users/${invalidUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  test("Update User", async () => {
    const response = await request(server)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "updateduser@test.com" });

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe("updateduser@test.com");
  });

  test("Update User with Invalid Token", async () => {
    const response = await request(server)
      .put(`/api/users/${userId}`)
      .set("Authorization", "Bearer invalidToken") // Invalid token
      .send({ email: "updatedemail@test.com" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token.");
  });

  test("Login User", async () => {
    const response = await request(server).post("/api/users/loginUser").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  test("Login User with Incorrect Password", async () => {
    const response = await request(server).post("/api/users/loginUser").send({
      username: testUser.username,
      password: "wrongpassword", // Incorrect password
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid username or password");
  });

  test("Validate Token", async () => {
    const response = await request(server)
      .post("/api/users/validate-token")
      .send({ accessToken: authToken });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.id).toBe(userId);
    expect(response.body.user.username).toBe(testUser.username);
  });

  test("Validate Token (Invalid Token)", async () => {
    const response = await request(server)
      .post("/api/users/validate-token")
      .send({ accessToken: "invalidAccessToken" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Invalid or expired access token");
  });

  test("Logout User", async () => {
    const response = await request(server)
      .post("/api/users/logoutUser")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Logged out successfully");

    const user = await userModel.findById(userId);
    expect(user?.tokens).not.toContain(refreshToken);
  });

  test("Logout User (No Refresh Token)", async () => {
    const response = await request(server)
      .post("/api/users/logoutUser")
      .set("Cookie", "refreshToken=invalidToken");

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token.");
  });

  test("Refresh Token", async () => {
    const response = await request(server)
      .post("/api/users/refreshToken")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid req");
  });

  test("Refresh Token (Invalid Refresh Token)", async () => {
    const response = await request(server)
      .post("/api/users/refreshToken")
      .set("Cookie", "refreshToken=invalidRefreshToken");

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Invalid or expired refresh token");
  });

  test("Get User by ID (Unauthorized)", async () => {
    const response = await request(server)
      .get(`/api/users/${userId}`)
      .set("Authorization", "Bearer invalidToken");

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token.");
  });
});
