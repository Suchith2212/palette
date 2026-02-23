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
const Event_1 = __importDefault(require("./models/Event"));
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
const checkEvent = () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectDB();
    try {
        const event = yield Event_1.default.findOne({ title: 'Cultural Quiz' });
        if (event) {
            console.log('--- Cultural Quiz Event Details ---');
            console.log(`Title: ${event.title}`);
            console.log(`Date: ${event.date ? event.date.toISOString() : 'N/A'}`);
            console.log(`EndDate: ${event.endDate ? event.endDate.toISOString() : 'N/A'}`);
            console.log(`Type: ${event.type}`);
            console.log(`Status: ${event.status}`);
        }
        else {
            console.log('Event "Cultural Quiz" not found in the database.');
        }
        const now = new Date();
        const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        console.log(`--- Server's perception of today (UTC 00:00:00) ---`);
        console.log(`startOfTodayUTC: ${startOfTodayUTC.toISOString()}`);
        console.log(`Current Server Time (UTC): ${now.toISOString()}`);
        process.exit(0);
    }
    catch (error) {
        console.error(`Error checking event: ${error}`);
        process.exit(1);
    }
});
checkEvent();
