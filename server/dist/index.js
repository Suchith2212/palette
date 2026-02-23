"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const artworkRoutes_1 = __importDefault(require("./routes/artworkRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const exhibitionRoutes_1 = __importDefault(require("./routes/exhibitionRoutes")); // New import
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs"); // Import fs.promises
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../uploads');
fs_1.promises.mkdir(uploadsDir, { recursive: true })
    .then(() => console.log('Uploads directory ensured:', uploadsDir))
    .catch(err => console.error('Failed to ensure uploads directory:', err));
// Middleware to parse JSON bodies and enable CORS
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Serve static files from the 'uploads' directory
app.use('/uploads', express_1.default.static(uploadsDir)); // Use the defined uploadsDir
// Mount auth routes
app.use('/api/auth', authRoutes_1.default);
// Mount user routes
app.use('/api/users', userRoutes_1.default);
// Mount artwork routes
app.use('/api/artwork', artworkRoutes_1.default);
// Mount event routes
app.use('/api/events', eventRoutes_1.default);
// Mount exhibition routes
app.use('/api/exhibition', exhibitionRoutes_1.default); // New mount
app.use('/api/contact', contactRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Palette Art Club Server is running!');
});
// Generic error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    // Log the full error stack to the server console for debugging
    console.error(err.stack);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
