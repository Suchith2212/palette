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
const User_1 = __importDefault(require("./models/User"));
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
const importArtworks = () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectDB();
    try {
        // Clear existing artworks before importing
        yield Artwork_1.default.deleteMany();
        console.log('Existing artworks cleared.');
        // Find an admin user to assign as 'artist'
        const adminUser = yield User_1.default.findOne({ isAdmin: true });
        if (!adminUser) {
            console.error('No admin user found. Please create an admin user first.');
            process.exit(1);
        }
        const sampleArtworks = [
            {
                title: 'Abstract Flow',
                description: 'A vibrant abstract piece exploring movement and color.',
                credits: 'Artist X',
                imageUrl: '/uploads/exhibition/ex_1.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'City at Dusk',
                description: 'A serene cityscape bathed in the warm hues of twilight.',
                credits: 'Jane Doe',
                imageUrl: '/uploads/exhibition/ex_2.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'Forest Whisper',
                description: 'Deep forest with subtle light filtering through leaves.',
                credits: 'John Smith',
                imageUrl: '/uploads/exhibition/ex_3.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'Ocean\'s Embrace',
                description: 'Waves crashing on a rocky shore under a stormy sky.',
                credits: 'Emily White',
                imageUrl: '/uploads/exhibition/ex_4.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'Mountain Majesty',
                description: 'Towering peaks reaching for the clouds, covered in snow.',
                credits: 'David Green',
                imageUrl: '/uploads/exhibition/ex_5.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'Desert Bloom',
                description: 'A rare flower blooming defiantly in arid lands.',
                credits: 'Sarah Blue',
                imageUrl: '/uploads/exhibition/ex_6.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'Starlight Symphony',
                description: 'A cosmic dance of stars and nebulae.',
                credits: 'Michael Black',
                imageUrl: '/uploads/exhibition/ex_7.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
            {
                title: 'Geometric Harmony',
                description: 'Interlocking shapes creating a sense of balance.',
                credits: 'Laura Red',
                imageUrl: '/uploads/exhibition/ex_8.jpeg',
                artist: adminUser._id,
                status: 'approved',
            },
        ];
        yield Artwork_1.default.insertMany(sampleArtworks);
        console.log('Sample Artworks Imported!');
        process.exit();
    }
    catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
});
importArtworks();
