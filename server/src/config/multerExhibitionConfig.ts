import multer from 'multer';
import path from 'path';
import fs from 'fs';

const destination = path.join(__dirname, '../../uploads/exhibition');

// Ensure the destination directory exists
if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, { recursive: true });
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create the multer instance
const uploadExhibition = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed.'));
  },
});

export default uploadExhibition;
