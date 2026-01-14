import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/errors';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        const userId = req.user?.id || 'temp';
        const uploadPath = path.join('uploads', userId);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only PDF or DOCX.', 400) as any, false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});
