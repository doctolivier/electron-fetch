import { UrlWithStringQuery } from "node:url";
import { RequestInit } from "./types.js";
import Body from "./body.js";
export type RequestInfo = Request | RequestInit | string;
/**
 * Request class
 *
 * @param {string|Request} input Url or Request instance
 * @param {Object} init Custom options
 */
export default class Request extends Body {
    method: any;
    redirect: any;
    signal: any;
    chunkedEncoding: boolean;
    useElectronNet: boolean;
    useSessionCookies: boolean;
    follow: any;
    counter: number;
    session: Electron.Session;
    constructor(input: RequestInfo, init?: RequestInit);
    set url(url: UrlWithStringQuery);
    get url(): string;
    /**
     * Clone this request
     *
     * @return {Request}
     */
    clone(): Request;
}
