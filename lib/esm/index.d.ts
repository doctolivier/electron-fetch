/**
 * index.js
 *
 * a request API compatible with window.fetch
 */
import Response from "./response.js";
import Headers from "./headers.js";
import Request from "./request.js";
import FetchError from "./fetch-error.js";
import { RequestInit } from "./types.js";
/**
 * Fetch function
 *
 * @param {string|Request} url Absolute url or Request instance
 * @param {Object} [opts] Fetch options
 * @return {Promise}
 */
declare function fetch(url: string | Request, opts?: RequestInit): Promise<unknown>;
declare namespace fetch {
    var isRedirect: (code: number) => code is 301 | 302 | 303 | 307 | 308;
}
export default fetch;
export { Headers, Request, Response, FetchError };
