"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const rootDir = path_1.default.resolve(__dirname, "../../"); // Going tow levels up from 'src'
const uploadDir = path_1.default.join(rootDir, "media");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    console.log("media directory created");
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "media/");
    },
    filename: (_req, file, cb) => {
        const ext = file.originalname.split(".").filter(Boolean).slice(1).join(".");
        cb(null, Date.now() + "." + ext);
    },
});
const upload = (0, multer_1.default)({ storage });
exports.upload = upload;
