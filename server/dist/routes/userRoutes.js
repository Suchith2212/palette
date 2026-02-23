"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.route('/profile')
    .get(authMiddleware_1.protect, userController_1.getUserProfile)
    .put(authMiddleware_1.protect, userController_1.updateUserProfile);
router.get('/my-artwork', authMiddleware_1.protect, userController_1.getMyArtwork);
router.get('/my-events', authMiddleware_1.protect, userController_1.getMyEvents);
exports.default = router;
