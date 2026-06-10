import multer from 'multer';
import path from 'path';

const sanitizeFilename = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`);
  },
});

const artworkUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error('Only JPG, JPEG, PNG, or WEBP images are allowed for artwork.'));
  },
});

export default artworkUpload;
