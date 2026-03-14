import multer from "multer";
import fs from "fs";
import path from "path";

const rootDir = path.resolve(__dirname, "../../"); // Going tow levels up from 'src'
const uploadDir = path.join(rootDir, "media");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("media directory created");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "media/");
  },
  filename: (_req, file, cb) => {
    const ext = file.originalname.split(".").filter(Boolean).slice(1).join(".");

    cb(null, Date.now() + "." + ext);
  },
});

const upload = multer({ storage });

export { upload };
