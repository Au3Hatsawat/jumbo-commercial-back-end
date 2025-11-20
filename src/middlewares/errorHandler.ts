import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.errorCode,
            message: err.message
        });
    }

    // ถ้าเป็น Error อื่นๆ (เช่น Prisma Error, Server Error)
    console.error('Unexpected Error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
};