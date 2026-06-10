import multer from 'multer';
import path from 'path';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the uploads directory exists relative to the server's root
    cb(null, path.join(__dirname, '../../uploads')); // Corrected path
  },
  filename: function (_req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldNameSize: 100, fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error('Only JPG, JPEG, PNG, WEBP, or GIF images are allowed for events.'));
  },
});

export default upload;
