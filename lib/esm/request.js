import {
  format as formatURL,
  parse as parseURL
} from "node:url";
import { clone, extractContentType } from "./common.js";
import Headers from "./headers.js";
import Body from "./body.js";
class Request extends Body {
  method;
  redirect;
  signal;
  chunkedEncoding;
  useElectronNet;
  useSessionCookies;
  follow;
  counter;
  session;
  constructor(input, init = {}) {
    let parsedURL;
    if (!(input instanceof Request)) {
      if (input && input.href) {
        parsedURL = parseURL(input.href);
      } else {
        parsedURL = parseURL(`${input}`);
      }
      input = {};
    } else {
      parsedURL = parseURL(input.url);
    }
    const method = init.method || input.method || "GET";
    if ((init.body != null || input instanceof Request && input.body !== null) && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init.body != null ? init.body : input instanceof Request && input.body !== null ? clone(input) : void 0;
    super(inputBody, {
      timeout: init.timeout || input.timeout || 0,
      size: init.size || input.size || 0
    });
    this.method = method.toUpperCase();
    this.redirect = init.redirect || input.redirect || "follow";
    this.signal = init.signal || input.signal || null;
    this.headers = new Headers(init.headers || input.headers || {});
    this.headers.delete("Content-Length");
    this.chunkedEncoding = false;
    this.useElectronNet = init.useElectronNet !== void 0 ? init.useElectronNet : input.useElectronNet;
    if (this.useElectronNet && !process.versions.electron)
      throw new Error("Cannot use Electron/net module on Node.js!");
    if (this.useElectronNet === void 0) {
      this.useElectronNet = Boolean(process.versions.electron);
    }
    if (this.useElectronNet) {
      this.useSessionCookies = init.useSessionCookies !== void 0 ? init.useSessionCookies : input.useSessionCookies;
    }
    if (init.body != null) {
      const contentType = extractContentType(this);
      if (contentType !== null && !this.headers.has("Content-Type")) {
        this.headers.append("Content-Type", contentType);
      }
    }
    this.follow = init.follow !== void 0 ? init.follow : input.follow !== void 0 ? input.follow : 20;
    this.counter = init.counter || input.counter || 0;
    this.session = init.session || input.session;
    this.url = parsedURL;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Request",
      writable: false,
      enumerable: false,
      configurable: true
    });
  }
  set url(url) {
    this.url = url;
  }
  get url() {
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
  configurable: true
});
export {
  Request as default
};
//# sourceMappingURL=request.js.map
