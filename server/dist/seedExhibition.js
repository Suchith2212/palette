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
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const Exhibition_1 = __importDefault(require("./models/Exhibition"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, db_1.default)();
const importExhibitionData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear existing exhibition data
        yield Exhibition_1.default.deleteMany();
        console.log('Exhibition data cleared!');
        const exhibJsonPath = path_1.default.join(__dirname, '..', '..', 'client', 'src', 'components', 'exhibition_items.json');
        const rawData = (0, fs_1.readFileSync)(exhibJsonPath, 'utf-8');
        const data = JSON.parse(rawData);
        if (!data || !Array.isArray(data.events)) {
            throw new Error('exhib.json is not in expected format (missing events array).');
        }
        // Add imageUrl to each item, assuming a pattern or using a placeholder
        const exhibitionItemsWithImages = data.events.map((item, index) => (Object.assign(Object.assign({}, item), { 
            // Placeholder image URL - adjust if you have actual image files to map
            imageUrl: `/uploads/exhibition/ex_${index + 1}.jpeg` })));
        yield Exhibition_1.default.insertMany(exhibitionItemsWithImages);
        console.log('Exhibition data imported!');
        process.exit();
    }
    catch (error) {
        console.error(`Error importing exhibition data: ${error}`);
        process.exit(1);
    }
});
importExhibitionData();
