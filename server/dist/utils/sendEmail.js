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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Create a transporter
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT), // Port for secure SMTP is usually 465 or 587
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports like 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3', // This can sometimes help with older SMTP servers
            rejectUnauthorized: false, // Use with caution, for local development/self-signed certs
        }
    });
    // 2. Define the email options
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Palette Art Club'}" <${process.env.EMAIL_FROM_EMAIL || 'noreply@palette.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };
    // 3. Send the email
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info)); // Only available if using ethereal
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.default = sendEmail;
