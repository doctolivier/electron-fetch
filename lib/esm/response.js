import { STATUS_CODES } from "http";
import { clone } from "./common.js";
import Headers from "./headers.js";
import Body from "./body.js";
class Response extends Body {
  status;
  statusText;
  headers;
  useElectronNet;
  constructor(body, init = {}) {
    super(body, init);
    this.url = init.url || "";
    this.status = init.status || 200;
    this.statusText = init.statusText || STATUS_CODES[this.status];
    this.headers = new Headers(
      init.headers ? init.headers : {}
    );
    this.useElectronNet = init.useElectronNet || false;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Response",
      writable: false,
      enumerable: false,
      configurable: true
    });
  }
  /**
   * Convenience property representing if the request ended normally
   */
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  /**
   * Clone this response
   *
   * @return {Response}
   */
  clone() {
    return new Response(clone(this), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      useElectronNet: this.useElectronNet
    });
  }
}
Object.defineProperty(Response.prototype, Symbol.toStringTag, {
  value: "ResponsePrototype",
  writable: false,
  enumerable: false,
  configurable: true
});
export {
  Response as default
};
//# sourceMappingURL=response.js.map
