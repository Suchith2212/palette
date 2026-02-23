"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.route('/')
    .get(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), contactController_1.getContactSubmissions)
    .post(contactController_1.submitContactForm);
router.route('/:id')
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), contactController_1.deleteContactSubmission);
exports.default = router;
