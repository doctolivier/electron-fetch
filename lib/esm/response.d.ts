import { BodyInit, ResponseInit } from "./types.js";
import Headers from "./headers.js";
import Body from "./body.js";
/**
 * Response class
 *
 * @param {Stream} body Readable stream
 * @param {Object} opts Response options
 */
export default class Response extends Body {
    readonly status: number;
    readonly statusText: string | undefined;
    readonly headers: Headers;
    private useElectronNet;
    constructor(body: BodyInit, init?: ResponseInit);
    /**
     * Convenience property representing if the request ended normally
     */
    get ok(): boolean;
    /**
     * Clone this response
     *
     * @return {Response}
     */
    clone(): Response;
}
