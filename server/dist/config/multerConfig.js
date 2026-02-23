"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Set up storage for uploaded files
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the uploads directory exists relative to the server's root
        cb(null, path_1.default.join(__dirname, '../../uploads')); // Corrected path
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// Create the multer instance
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fieldNameSize: 100 }, // Allow for longer field names, just in case
    fileFilter: (req, file, cb) => {
        // Only allow PNG files for events
        const filetypes = /png/; // Changed from /jpeg|jpg|png|gif/
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        // Correct error message
        cb(new Error('Only PNG images are allowed for events.')); // Updated message
    },
});
exports.default = upload;
