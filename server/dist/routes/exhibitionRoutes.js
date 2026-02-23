"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exhibitionController_1 = require("../controllers/exhibitionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerExhibitionConfig_1 = __importDefault(require("../config/multerExhibitionConfig"));
const router = (0, express_1.Router)();
router.route('/')
    .get(exhibitionController_1.getExhibitionItems)
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), multerExhibitionConfig_1.default.single('image'), exhibitionController_1.createExhibitionItem);
router.route('/:id')
    .get(exhibitionController_1.getExhibitionItemById)
    .put(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), multerExhibitionConfig_1.default.single('image'), exhibitionController_1.updateExhibitionItem)
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), exhibitionController_1.deleteExhibitionItem);
exports.default = router;
