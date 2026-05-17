import enErrors from '../../locales/errors.en.json';

export type ErrorCode = keyof typeof enErrors;

export interface ErrorDetail {
    status: number;
    title: string;
    message: string;
}