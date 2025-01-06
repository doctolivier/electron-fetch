import http from "node:http";
import { BodyInit } from "./types.js";
import type Response from "./response.js";
import type Request from "./request.js";
export declare function checkIsHttpToken(val: string): boolean;
/**
 * True if val contains an invalid field-vchar
 *  field-value    = *( field-content / obs-fold )
 *  field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 *  field-vchar    = VCHAR / obs-text
 *
 * checkInvalidHeaderChar() is currently designed to be inlinable by v8,
 * so take care when making changes to the implementation so that the source
 * code size does not exceed v8's default max_inlined_source_size setting.
 **/
export declare function checkInvalidHeaderChar(val: string): boolean;
export declare function sanitizeName(name: string): string;
export declare function sanitizeValue(value: string): string;
/**
 * Convert encoding of an UTF-8 string or a buffer
 *
 * @param {String|Buffer} str String to be converted
 * @param {String} to Encoding to be converted to
 * @param {String} [from='UTF-8'] Encoding to be converted from
 * @return {Buffer} Encoded string
 */
export declare function convert(str: (string | Buffer) | undefined, to: string, from: string): Buffer;
/**
 * Clone body given Res/Req instance
 *
 * @param {Response|Request} instance Response or Request instance
 * @return {string|Blob|Buffer|Stream}
 */
export declare function clone(instance: Response | Request): BodyInit;
/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present and non-null.
 *
 * @param {Response|Request} instance Response or Request instance
 */
export declare function extractContentType(instance: Response | Request): string | null;
export declare function getTotalBytes(instance: Response | Request): any;
export declare function writeToStream(dest: http.ClientRequest | Electron.ClientRequest, instance: Response | Request): void;
export declare function getNodeRequestOptions(request: Request): string & {
    method: any;
    headers: any;
};
