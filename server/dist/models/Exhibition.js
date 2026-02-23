"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const exhibitionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    credits: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Exhibition', exhibitionSchema);
