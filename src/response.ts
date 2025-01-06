/**
 * Response class provides content decoding
 */
import { STATUS_CODES } from "http";

import { BodyInit, ResponseInit } from "./types.js";
import { clone } from "./common.js";
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
  private useElectronNet: boolean;

  constructor(body: BodyInit, init: ResponseInit = {}) {
    super(body as BodyInit | undefined, init);

    this.url = init.url || "";
    this.status = init.status || 200;
    this.statusText = init.statusText || STATUS_CODES[this.status];
    this.headers = new Headers(
      init.headers ? (init.headers as { [key: string]: string }) : {}
    );
    this.useElectronNet = init.useElectronNet || false;

    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Response",
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }

  /**
   * Convenience property representing if the request ended normally
   */
  public get ok() {
    return this.status >= 200 && this.status < 300;
  }

  /**
   * Clone this response
   *
   * @return {Response}
   */
  public clone() {
    return new Response(clone(this), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      useElectronNet: this.useElectronNet,
    });
  }
}

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
  value: "ResponsePrototype",
  writable: false,
  enumerable: false,
  configurable: true,
});
