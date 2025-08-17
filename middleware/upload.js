import multer from 'multer';

// Configure multer for memory storage (no local file saving)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 32 * 1024 * 1024, // 32MB limit (ImgBB limit)
    files: 5, // Maximum 5 files
  },
});

export default upload;
