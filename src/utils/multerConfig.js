const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'img', 'products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // product-user-id-timestamp.extension
        const ext = file.mimetype.split('/')[1];
        cb(null, `product-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

module.exports = upload;
