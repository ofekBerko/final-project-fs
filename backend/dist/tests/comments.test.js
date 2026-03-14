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
const postModel_1 = __importDefault(require("../models/postModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
const config_1 = require("../const/config");
const index_1 = require("../index");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const testUser = {
    email: "test@user.com",
    username: "username",
    password: "testpassword",
};
let postId = "";
const filePath = path_1.default.join(__dirname, "test-post-image.jpg");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(config_1.mongoURI);
    yield postModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    yield commentModel_1.default.deleteMany();
    yield (0, supertest_1.default)(index_1.server).post("/api/users/").send(testUser);
    const res = yield (0, supertest_1.default)(index_1.server).post("/api/users/loginUser").send(testUser);
    testUser.token = res.body.accessToken;
    testUser._id = res.body.user.id;
    expect(testUser.token).toBeDefined();
    fs_1.default.writeFileSync(filePath, "dummy content");
    const postResponse = yield (0, supertest_1.default)(index_1.server)
        .post("/api/posts")
        .set("Authorization", `Bearer ${testUser.token}`)
        .attach("image", filePath)
        .field("content", "Test image");
    expect(postResponse.statusCode).toBe(201);
    postId = postResponse.body.id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield postModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    yield commentModel_1.default.deleteMany();
    fs_1.default.unlinkSync(filePath);
    yield mongoose_1.default.connection.close();
    index_1.server.close();
}));
describe("Comment Tests", () => {
    test("Test Create Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/comments")
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            content: "This is a comment on the post",
            postId,
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe("This is a comment on the post");
        expect(response.body.user.id).toBe(testUser._id);
    }));
    test("Test Get Comments by Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/comments/${postId}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].content).toBe("This is a comment on the post");
    }));
    test("Test Create Comment Fail (No Content)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/comments")
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            postId,
        });
        expect(response.statusCode).toBe(500);
    }));
    test("Test Create Comment Fail (Invalid Token)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/comments")
            .set("Authorization", "Bearer invalidToken")
            .send({
            content: "This is a comment with invalid token",
            postId,
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Invalid or expired token.");
    }));
    test("Test Get Comments by Post Fail (Invalid Post ID)", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidPostId = "invalidPostId";
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/comments/${invalidPostId}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error getting comments");
    }));
    test("Test Create Comment Fail (Missing PostId)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/comments")
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            content: "This is a comment without postId",
        });
        expect(response.statusCode).toBe(201);
    }));
    test("Test Create Comment Fail (User Not Logged In)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server).post("/api/comments").send({
            content: "This is a comment while not logged in",
            postId,
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Access denied. No token provided.");
    }));
    test("Test Create Comment with Long Content", () => __awaiter(void 0, void 0, void 0, function* () {
        const longContent = "A".repeat(1000);
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/comments")
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            content: longContent,
            postId,
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(longContent);
    }));
    test("Test Get Comments Paginated", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/comments/${postId}?page=1&limit=2`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(2);
    }));
});
