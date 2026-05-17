import { Request, Response, NextFunction } from 'express';

import thErrors from '../locales/errors.th.json';
import enErrors from '../locales/errors.en.json';
import { AppError } from '../utils/errutils/appError';
import { ErrorDetail } from '../utils/errutils/errorConfigs';

const errorDictionaries: Record<string, Record<string, ErrorDetail>> = {
    th: thErrors,
    en: enErrors
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const langHeader = req.headers['accept-language'];
    const locale = langHeader && langHeader.includes('th') ? 'th' : 'en';

    const dictionary = errorDictionaries[locale];

    if (err instanceof AppError) {
        const errorInfo = dictionary[err.errorCode] || dictionary['UNKNOWN_ERROR'];

        return res.status(errorInfo.status).json({
            code: err.errorCode,
            status: errorInfo.status,
            title: errorInfo.title,
            message: errorInfo.message,
        });
    }

    console.error('Unexpected Error:', err);
    const fallbackError = dictionary['UNKNOWN_ERROR'];

    return res.status(fallbackError.status).json({
            code: 'UNKNOWN_ERROR',
            status: fallbackError.status,
            title: fallbackError.title,
            message: fallbackError.message,
            details: null
    });
};