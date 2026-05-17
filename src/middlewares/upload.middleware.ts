import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadProductDir = 'public/uploads/products';
const uploadSellingOptionDir = 'public/uploads/selling-options';
if (!fs.existsSync(uploadProductDir)) {
    fs.mkdirSync(uploadProductDir, { recursive: true });
}

if (!fs.existsSync(uploadSellingOptionDir)) {
    fs.mkdirSync(uploadSellingOptionDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const action = req.query.action;
        if (action === "1") {
            cb(null, uploadProductDir);
        } else if (action === "2") {
            cb(null, uploadSellingOptionDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
    }
};

export const uploadProductImage = multer({ storage: storage, fileFilter: fileFilter });