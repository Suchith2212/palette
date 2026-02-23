"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const destination = path_1.default.join(__dirname, '../../uploads/exhibition');
// Ensure the destination directory exists
if (!fs_1.default.existsSync(destination)) {
    fs_1.default.mkdirSync(destination, { recursive: true });
}
// Set up storage for uploaded files
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, destination);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// Create the multer instance
const uploadExhibition = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed.'));
    },
});
exports.default = uploadExhibition;
