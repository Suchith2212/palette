"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.registerUser);
router.post('/verify-code', authController_1.verifyUserCode); // New route for numeric code verification
router.post('/login', authController_1.loginUser);
router.get('/me', authMiddleware_1.protect, authController_1.getMe); // Protected route to get user profile
router.put('/profile', authMiddleware_1.protect, authController_1.updateUserProfile); // Protected route to update user profile
exports.default = router;
