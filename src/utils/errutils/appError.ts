import { ErrorCode } from "./errorConfigs";

export class AppError extends Error {
    public errorCode: ErrorCode;

    constructor(errorCode: ErrorCode) {
        super(errorCode);
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}