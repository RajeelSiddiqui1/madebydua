import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Middleware to handle file uploads for different folders
 * @param {string} folder - 'product' or 'category'
 * @param {number} maxCount - maximum number of files (default 10)
 */
const upload = (folder, maxCount = 10) => {
  const uploadPath = path.join(process.cwd(), `uploads/${folder}`);

  // create folder if not exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // storage config
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;
      cb(null, uniqueName);
    },
  });

  // file filter
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg, png images are allowed"), false);
    }
  };

  return multer({ storage, fileFilter, limits: { files: maxCount } });
};

export default upload;
