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
exports.deleteExhibitionItem = exports.getExhibitionItemById = exports.updateExhibitionItem = exports.createExhibitionItem = exports.getExhibitionItems = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Exhibition_1 = __importDefault(require("../models/Exhibition"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
exports.getExhibitionItems = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exhibitions = yield Exhibition_1.default.find({}).sort('-createdAt');
    res.json(exhibitions);
}));
exports.createExhibitionItem = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
    if (!req.file) {
        res.status(400);
        throw new Error('No image file uploaded');
    }
    const { title, description, date, time, venue, credits } = req.body;
    const imageUrl = `/uploads/exhibition/${req.file.filename}`;
    console.log('Generated imageUrl for database (exhibition):', imageUrl);
    console.log('Expected server upload path for file (exhibition):', path_1.default.join(__dirname, '../../uploads/exhibition', req.file.filename));
    const exhibition = new Exhibition_1.default({
        title,
        description,
        date,
        time,
        venue,
        credits,
        imageUrl,
    });
    const createdExhibition = yield exhibition.save();
    res.status(201).json(createdExhibition);
}));
exports.updateExhibitionItem = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
    const { id } = req.params;
    const { title, description, date, time, venue, credits } = req.body;
    const exhibition = yield Exhibition_1.default.findById(id);
    if (!exhibition) {
        res.status(404);
        throw new Error('Exhibition item not found');
    }
    // If a new image is uploaded, delete the old one
    if (req.file && exhibition.imageUrl) {
        const oldImagePath = path_1.default.join(__dirname, '../../uploads/exhibition', path_1.default.basename(exhibition.imageUrl));
        try {
            yield fs_1.promises.unlink(oldImagePath);
            console.log(`Deleted old exhibition image: ${oldImagePath}`);
        }
        catch (err) {
            console.error(`Failed to delete old exhibition image: ${oldImagePath}`, err);
        }
        exhibition.imageUrl = `/uploads/exhibition/${req.file.filename}`;
    }
    exhibition.title = title || exhibition.title;
    exhibition.description = description || exhibition.description;
    exhibition.date = date || exhibition.date;
    exhibition.time = time || exhibition.time;
    exhibition.venue = venue || exhibition.venue;
    exhibition.credits = credits || exhibition.credits;
    const updatedExhibition = yield exhibition.save();
    res.json(updatedExhibition);
}));
exports.getExhibitionItemById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exhibition = yield Exhibition_1.default.findById(req.params.id);
    if (exhibition) {
        res.json(exhibition);
    }
    else {
        res.status(404);
        throw new Error('Exhibition item not found');
    }
}));
exports.deleteExhibitionItem = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
    const { id } = req.params;
    const exhibition = yield Exhibition_1.default.findById(id);
    if (!exhibition) {
        res.status(404);
        throw new Error('Exhibition item not found');
    }
    // Delete the image file from the uploads directory
    if (exhibition.imageUrl) {
        const imagePath = path_1.default.join(__dirname, '../../uploads/exhibition', path_1.default.basename(exhibition.imageUrl));
        try {
            yield fs_1.promises.unlink(imagePath);
            console.log(`Deleted exhibition image: ${imagePath}`);
        }
        catch (err) {
            console.error(`Failed to delete exhibition image: ${imagePath}`, err);
            // Log the error but proceed with deleting the DB record.
        }
    }
    yield exhibition.deleteOne();
    res.json({ message: 'Exhibition item removed successfully' });
}));
