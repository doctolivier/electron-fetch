import { FetchErrorType } from "./types.js";
export default class FetchError extends Error {
    message: string;
    type: FetchErrorType;
    code?: string;
    errno?: string;
    constructor(message: string, type: FetchErrorType, systemError?: {
        code: string;
    });
}
