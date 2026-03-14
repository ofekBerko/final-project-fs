"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const config_1 = require("./const/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const commentRoute_1 = __importDefault(require("./routes/commentRoute"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const contentRoute_1 = __importDefault(require("./routes/contentRoute"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
let server;
exports.server = server;
if (process.env.NODE_ENV !== "production") {
    console.log("development mode - using HTTP");
    exports.server = server = http_1.default.createServer(app);
}
else {
    console.log("production mode - using HTTPS");
    const options = {
        key: fs_1.default.readFileSync("../client-key.pem"),
        cert: fs_1.default.readFileSync("../client-cert.pem"),
    };
    exports.server = server = https_1.default.createServer(options, app);
}
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: "Content-Type, Authorization, Cross-Origin-Opener-Policy, same-origin-allow-popups",
    credentials: true,
}));
mongoose_1.default
    .connect(config_1.mongoURI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));
app.use("/api/users", userRoute_1.default);
app.use("/api/auth", authRoute_1.default);
app.use("/api/posts", postRoute_1.default);
app.use("/api/comments", commentRoute_1.default);
app.use("/api/content", contentRoute_1.default);
app.use("/api/media/", express_1.default.static("media"));
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
            { url: "https://node105.cs.colman.ac.il/api" },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/swaggerDef.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
app.use(express_1.default.static("frontend"));
app.get("*", (_req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../frontend", "index.html"));
});
server.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
