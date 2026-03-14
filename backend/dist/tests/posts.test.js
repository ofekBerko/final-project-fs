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
    yield (0, supertest_1.default)(index_1.server).post("/api/users/").send(testUser);
    const res = yield (0, supertest_1.default)(index_1.server).post("/api/users/loginUser").send(testUser);
    testUser.token = res.body.accessToken;
    testUser._id = res.body.user.id;
    fs_1.default.writeFileSync(filePath, "dummy content");
    expect(testUser.token).toBeDefined();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    fs_1.default.unlinkSync(filePath);
    yield postModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    index_1.server.close();
}));
describe("Posts Tests", () => {
    test("Posts test get all", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
    test("Test Get Posts By User With No Posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/posts/${testUser._id}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
    test("Test Create Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Test Content");
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe("Test Content");
        expect(response.body.image).toMatch(/media\/\d+\.\w+/);
        postId = response.body.id;
    }));
    test("Test get post by user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/posts/${testUser._id}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].content).toBe("Test Content");
        expect(response.body[0].image).toMatch(/media\/\d+\.\w+/);
    }));
    test("Test Create Post 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Test Content 2");
        expect(response.statusCode).toBe(201);
    }));
    test("Posts test get all 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    }));
    test("Test Delete Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .delete(`/api/posts/${postId}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
    }));
    test("Test Create Post Fail (Missing Content)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Error creating post");
    }));
    test("Test Create Post fail (Missing Image)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            content: "Test Content 2",
        });
        expect(response.statusCode).toBe(500);
    }));
    test("Test Update Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Initial Content");
        expect(createResponse.statusCode).toBe(201);
        const postIdToUpdate = createResponse.body.id;
        const updateResponse = yield (0, supertest_1.default)(index_1.server)
            .put(`/api/posts/${postIdToUpdate}`)
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            content: "Updated Content",
        });
        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body.content).toBe("Updated Content");
    }));
    test("Test Like Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Content to Like");
        expect(createResponse.statusCode).toBe(201);
        const postIdToLike = createResponse.body.id;
        const likeResponse = yield (0, supertest_1.default)(index_1.server)
            .post(`/api/posts/like/${postIdToLike}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(likeResponse.statusCode).toBe(200);
        expect(likeResponse.body.isUserLiked).toBe(true);
        const unlikeResponse = yield (0, supertest_1.default)(index_1.server)
            .post(`/api/posts/like/${postIdToLike}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(unlikeResponse.statusCode).toBe(200);
        expect(unlikeResponse.body.isUserLiked).toBe(false);
    }));
    test("Test Get Posts Paginated", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Post 1");
        yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Post 2");
        const response = yield (0, supertest_1.default)(index_1.server)
            .get("/api/posts?page=1&limit=1")
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    }));
    test("Test Get Posts By User With Pagination", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.server)
            .get(`/api/posts/${testUser._id}?page=1&limit=1`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].content).toBe("Test Content 2");
    }));
    test("Test Remove Post Fail (Non-existent Post ID)", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentPostId = "60d5f4d1e4b0f2db7f8d5c72"; // Random non-existent post ID
        const response = yield (0, supertest_1.default)(index_1.server)
            .delete(`/api/posts/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe("Post not found");
    }));
    test("Test Like Post (Already Liked)", () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(index_1.server)
            .post("/api/posts")
            .set("Authorization", `Bearer ${testUser.token}`)
            .attach("image", filePath)
            .field("content", "Post to Like");
        const postIdToLike = createResponse.body.id;
        yield (0, supertest_1.default)(index_1.server)
            .post(`/api/posts/like/${postIdToLike}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        const likeResponse = yield (0, supertest_1.default)(index_1.server)
            .post(`/api/posts/like/${postIdToLike}`)
            .set("Authorization", `Bearer ${testUser.token}`);
        expect(likeResponse.statusCode).toBe(200);
        expect(likeResponse.body.isUserLiked).toBe(false);
    }));
    test("Test Post Update Fail (Invalid Post ID)", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidPostId = "invalidPostId";
        const response = yield (0, supertest_1.default)(index_1.server)
            .put(`/api/posts/${invalidPostId}`)
            .set("Authorization", `Bearer ${testUser.token}`)
            .send({
            content: "Updated Content for invalid post",
        });
        expect(response.statusCode).toBe(500);
    }));
});
