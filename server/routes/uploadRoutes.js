import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.log('UPLOAD ERROR:', err);
      return res.status(500).json({ message: err.message || 'Upload failed' });
    }

    const isImage = req.file.mimetype.startsWith('image/');

    let url = req.file.path;
    if (!isImage) {
      url = req.file.path.replace('/upload/', '/upload/fl_attachment/');
    }

    console.log('FILE INFO:', req.file);

    res.json({
      url,
      filename: req.file.originalname,
      type: req.file.mimetype,
    });
  });
});
export default router;