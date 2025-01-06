export type HeadersInit = Headers | string[][] | {
    [key: string]: string;
};
/**
 * Headers class
 *
 * @param {Object} init Response headers
 */
export default class Headers {
    list: Record<string, string[]>;
    constructor(init?: HeadersInit);
    /**
     * Return first header value given name
     *
     * @param {string} name Header name
     * @return {string}
     */
    get(name: string): string | null;
    /**
     * Iterate over all headers
     *
     * @param {function} callback Executed for each item with parameters (value, name, thisArg)
     * @param {boolean} thisArg `this` context for callback function
     */
    forEach(callback: (value: string, name: string, headers: Headers) => void, thisArg?: any): void;
    /**
     * Overwrite header values given name
     *
     * @param {string} name Header name
     * @param {string|Array.<string|*>|*} value Header value
     */
    set(name: string, value: string): void;
    /**
     * Append a value onto existing header
     *
     * @param {string} name Header name
     * @param {string|Array.<string|*>|*} value Header value
     */
    append(name: string, value: string): void;
    /**
     * Check for header name existence
     *
     * @param {string} name Header name
     * @return {boolean}
     */
    has(name: string): boolean;
    /**
     * Delete all header values given name
     *
     * @param {string} name Header name
     */
    delete(name: string): void;
    /**
     * Return raw headers (non-spec api)
     *
     * @return {Object}
     */
    raw(): Record<string, string[]>;
    /**
     * Get an iterator on keys.
     *
     * @return {Iterator}
     */
    keys(): IterableIterator<string>;
    /**
     * Get an iterator on values.
     *
     * @return {Iterator}
     */
    values(): IterableIterator<string>;
    /**
     * Get an iterator on entries.
     *
     * This is the default iterator of the Headers object.
     *
     * @return {Iterator}
     */
    [Symbol.iterator](): IterableIterator<[string, string]>;
    entries(): IterableIterator<[string, string]>;
    getSetCookie(): string[];
}
