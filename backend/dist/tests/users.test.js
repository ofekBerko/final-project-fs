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
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../index");
const userModel_1 = __importDefault(require("../models/userModel"));
const config_1 = require("../const/config");
const testUser = {
    email: "test@user.com",
    username: "testuser",
    password: "testpassword",
};
let userId = "";
let authToken = "";
let refreshToken = "";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(config_1.mongoURI);
    if (!index_1.server.listening) {
        index_1.server.listen(3000);
    }
    yield userModel_1.default.deleteMany();
    const createUserResponse = yield (0, supertest_1.default)(index_1.server)
        .post("/api/users")
        .send(testUser);
    userId = createUserResponse.body.user.id;
    const loginResponse = yield (0, supertest_1.default)(index_1.server)
        .post("/api/users/loginUser")
        .send({
        username: testUser.username,
        password: testUser.password,
    });
    authToken = loginResponse.body.accessToken;
    expect(authToken).toBeDefined();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield userModel_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    index_1.server.close();
}));
describe("User Routes Tests", () => {
    test("Create User", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const response = yield (0, supertest_1.default)(index_1.server).post("/api/users").send({
            email: "newuser@test.com",
            username: "newuser",
            password: "newpassword",
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.user.email).toBe("newuser@test.com");
        expect(response.body.user.username).toBe("newuser");
        refreshToken = (_b = (_a = response.headers["set-cookie"]
            .find((cookie) => cookie.startsWith("refreshToken"))) === null || _a === void 0 ? void 0 : _a.split(";")[0]) === null || _b === void 0 ? void 0 : _b.split("=")[1];
        expect(refreshToken).toBeDefined();
    }));
    test("Create User with Existing Username", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server).post("/api/users").send({
            email: "anotheruser@test.com",
            username: "newuser", // This username already exists from the previous test
            password: "anotherpassword",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Username is already taken");
    }));
    test("Create User with Existing Email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server).post("/api/users").send({
            email: "newuser@test.com", // This email already exists from the previous test
            username: "anothernewuser",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Email is already in use");
    }));
    test("Get User by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(userId);
        expect(response.body.email).toBe(testUser.email);
        expect(response.body.username).toBe(testUser.username);
    }));
    test("Get User (User Not Found)", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUserId = "60d5f4d1e4b0f2db7f8d5c73"; // Random non-existent user ID
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/users/${invalidUserId}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("User not found");
    }));
    test("Update User", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .put(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ email: "updateduser@test.com" });
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe("updateduser@test.com");
    }));
    test("Update User with Invalid Token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .put(`/api/users/${userId}`)
            .set("Authorization", "Bearer invalidToken") // Invalid token
            .send({ email: "updatedemail@test.com" });
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Invalid or expired token.");
    }));
    test("Login User", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server).post("/api/users/loginUser").send({
            username: testUser.username,
            password: testUser.password,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
    }));
    test("Login User with Incorrect Password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server).post("/api/users/loginUser").send({
            username: testUser.username,
            password: "wrongpassword", // Incorrect password
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid username or password");
    }));
    test("Validate Token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/users/validate-token")
            .send({ accessToken: authToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.user.id).toBe(userId);
        expect(response.body.user.username).toBe(testUser.username);
    }));
    test("Validate Token (Invalid Token)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/users/validate-token")
            .send({ accessToken: "invalidAccessToken" });
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Invalid or expired access token");
    }));
    test("Logout User", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/users/logoutUser")
            .set("Cookie", `refreshToken=${refreshToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Logged out successfully");
        const user = yield userModel_1.default.findById(userId);
        expect(user === null || user === void 0 ? void 0 : user.tokens).not.toContain(refreshToken);
    }));
    test("Logout User (No Refresh Token)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/users/logoutUser")
            .set("Cookie", "refreshToken=invalidToken");
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Invalid or expired token.");
    }));
    test("Refresh Token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/users/refreshToken")
            .set("Cookie", `refreshToken=${refreshToken}`);
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid req");
    }));
    test("Refresh Token (Invalid Refresh Token)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/users/refreshToken")
            .set("Cookie", "refreshToken=invalidRefreshToken");
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Invalid or expired refresh token");
    }));
    test("Get User by ID (Unauthorized)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/users/${userId}`)
            .set("Authorization", "Bearer invalidToken");
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Invalid or expired token.");
    }));
});
