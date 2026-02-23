import multer from 'multer';
import path from 'path';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the uploads directory exists relative to the server's root
    cb(null, path.join(__dirname, '../../uploads')); // Corrected path
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fieldNameSize: 100}, // Allow for longer field names, just in case
  fileFilter: (req, file, cb) => {
    // Only allow PNG files for events
    const filetypes = /png/; // Changed from /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    // Correct error message
    cb(new Error('Only PNG images are allowed for events.')); // Updated message
  },
});

export default upload;
