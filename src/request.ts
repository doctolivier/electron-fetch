import {
  format as formatURL,
  parse as parseURL,
  UrlWithStringQuery,
} from "node:url";
import { clone, extractContentType, getTotalBytes } from "./common.js";

import { BodyInit, RequestInit } from "./types.js";
import Headers from "./headers.js";
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

  constructor(input: RequestInfo, init: RequestInit = {}) {
    let parsedURL;

    // normalize input
    if (!(input instanceof Request)) {
      // @ts-ignore
      if (input && input.href) {
        // in order to support Node.js' Url objects; though WHATWG's URL objects
        // will fall into this branch also (since their `toString()` will return
        // `href` property anyway)
        // @ts-ignore
        parsedURL = parseURL(input.href);
      } else {
        // coerce input to a string before attempting to parse
        parsedURL = parseURL(`${input}`);
      }
      input = {} as RequestInfo;
    } else {
      parsedURL = parseURL(input.url);
    }

    const method = init.method || (input as Request).method || "GET";

    if (
      (init.body != null ||
        (input instanceof Request && input.body !== null)) &&
      (method === "GET" || method === "HEAD")
    ) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }

    const inputBody =
      init.body != null
        ? (init.body as BodyInit)
        : input instanceof Request && input.body !== null
        ? clone(input)
        : undefined;

    super(inputBody as BodyInit | undefined, {
      timeout: init.timeout || (input as Request).timeout || 0,
      size: init.size || (input as Request).size || 0,
    });

    // fetch spec options
    this.method = method.toUpperCase();
    this.redirect = init.redirect || (input as Request).redirect || "follow";
    this.signal = init.signal || (input as Request).signal || null;
    // @ts-ignore
    this.headers = new Headers(init.headers || input.headers || {});
    this.headers.delete("Content-Length"); // user cannot set content-length themself as per fetch spec
    this.chunkedEncoding = false;
    this.useElectronNet =
      init.useElectronNet !== undefined // have to do this instead of || because it can be set to false
        ? init.useElectronNet
        : (input as Request).useElectronNet;

    // istanbul ignore if
    if (this.useElectronNet && !process.versions.electron)
      throw new Error("Cannot use Electron/net module on Node.js!");

    if (this.useElectronNet === undefined) {
      this.useElectronNet = Boolean(process.versions.electron);
    }

    if (this.useElectronNet) {
      this.useSessionCookies =
        init.useSessionCookies !== undefined
          ? init.useSessionCookies
          : (input as Request).useSessionCookies;
    }

    if (init.body != null) {
      const contentType = extractContentType(this);
      if (contentType !== null && !this.headers.has("Content-Type")) {
        this.headers.append("Content-Type", contentType);
      }
    }

    // server only options
    this.follow =
      init.follow !== undefined
        ? init.follow
        : (input as Request).follow !== undefined
        ? (input as Request).follow
        : 20;
    this.counter = init.counter || (input as Request).counter || 0;
    this.session = init.session || (input as Request).session;

    this.url = parsedURL;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Request",
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }

  set url(url: UrlWithStringQuery) {
    this.url = url;
  }

  get url(): string {
    return formatURL(this.url);
  }

  /**
   * Clone this request
   *
   * @return {Request}
   */
  clone() {
    return new Request(this);
  }
}

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
  value: "RequestPrototype",
  writable: false,
  enumerable: false,
  configurable: true,
});
