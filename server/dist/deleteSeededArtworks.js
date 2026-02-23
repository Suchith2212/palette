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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Artwork_1 = __importDefault(require("./models/Artwork"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost/palette', {});
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
const deleteSeededArtworks = () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectDB();
    try {
        const seededImageUrls = [
            '/uploads/exhibition/ex_1.jpeg',
            '/uploads/exhibition/ex_2.jpeg',
            '/uploads/exhibition/ex_3.jpeg',
            '/uploads/exhibition/ex_4.jpeg',
            '/uploads/exhibition/ex_5.jpeg',
            '/uploads/exhibition/ex_6.jpeg',
            '/uploads/exhibition/ex_7.jpeg',
            '/uploads/exhibition/ex_8.jpeg',
        ];
        const deleteResult = yield Artwork_1.default.deleteMany({ imageUrl: { $in: seededImageUrls } });
        console.log(`Deleted ${deleteResult.deletedCount} seeded artworks from the database.`);
        // Optionally, delete the actual image files from the uploads folder
        for (const imageUrl of seededImageUrls) {
            const filename = path_1.default.basename(imageUrl);
            const imageFilePath = path_1.default.join(__dirname, '..', '..', 'uploads', 'exhibition', filename);
            try {
                yield fs_1.promises.unlink(imageFilePath);
                console.log(`Deleted image file: ${imageFilePath}`);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    console.log(`Image file not found (already deleted or never existed): ${imageFilePath}`);
                }
                else {
                    console.error(`Error deleting image file ${imageFilePath}: ${err.message}`);
                }
            }
        }
        process.exit();
    }
    catch (error) {
        console.error(`Error deleting seeded artworks: ${error}`);
        process.exit(1);
    }
});
deleteSeededArtworks();
