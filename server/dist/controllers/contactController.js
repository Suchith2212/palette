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
exports.deleteContactSubmission = exports.getContactSubmissions = exports.submitContactForm = void 0;
const Contact_1 = __importDefault(require("../models/Contact"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const submitContactForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, subject, message } = req.body;
        const newContact = new Contact_1.default({ name, email, subject, message });
        yield newContact.save();
        res.status(201).json({ message: 'Contact form submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.submitContactForm = submitContactForm;
const getContactSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contacts = yield Contact_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getContactSubmissions = getContactSubmissions;
exports.deleteContactSubmission = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
    const { id } = req.params;
    const submission = yield Contact_1.default.findById(id);
    if (!submission) {
        res.status(404);
        throw new Error('Contact submission not found');
    }
    yield submission.deleteOne();
    res.json({ message: 'Contact submission removed successfully' });
}));
