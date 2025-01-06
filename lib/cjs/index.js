"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
__export(src_exports, {
  FetchError: () => import_fetch_error.default,
  Headers: () => import_headers.default,
  Request: () => import_request.default,
  Response: () => import_response.default,
  default: () => fetch
});
module.exports = __toCommonJS(src_exports);
var import_electron = __toESM(require("electron"), 1);
var import_url = require("url");
var http = __toESM(require("http"), 1);
var https = __toESM(require("https"), 1);
var zlib = __toESM(require("zlib"), 1);
var import_stream = require("stream");
var import_common = require("./common.js");
var import_response = __toESM(require("./response.js"), 1);
var import_headers = __toESM(require("./headers.js"), 1);
var import_request = __toESM(require("./request.js"), 1);
var import_fetch_error = __toESM(require("./fetch-error.js"), 1);
var import_types = require("./types.js");
const isReady = import_electron.default && import_electron.default.app && !import_electron.default.app.isReady() ? new Promise((resolve) => import_electron.default.app.once("ready", resolve)) : Promise.resolve();
function fetch(url, opts = {}) {
  return isReady.then(
    () => new Promise((resolve, reject) => {
      const request = new import_request.default(url, opts);
      const options = (0, import_common.getNodeRequestOptions)(request);
      const send = request.useElectronNet ? import_electron.default.net.request : (
        // @ts-ignore
        (options.protocol === "https:" ? https : http).request
      );
      if (options.headers.host) {
        options.headers.host = options.headers.host[0];
      }
      if (request.signal && request.signal.aborted) {
        reject(new import_fetch_error.default("request aborted", import_types.FetchErrorType.Abort));
        return;
      }
      let headers;
      if (request.useElectronNet) {
        headers = options.headers;
        delete options.headers;
        options.session = opts.session || import_electron.default.session.defaultSession;
        options.useSessionCookies = request.useSessionCookies;
      } else {
        if (opts.agent) options.agent = opts.agent;
        if (opts.onLogin)
          reject(
            new Error(
              '"onLogin" option is only supported with "useElectronNet" enabled'
            )
          );
      }
      const req = send(options);
      if (request.useElectronNet) {
        for (const headerName in headers) {
          if (typeof headers[headerName] === "string")
            req.setHeader(headerName, headers[headerName]);
          else {
            for (const headerValue of headers[headerName]) {
              req.setHeader(headerName, headerValue);
            }
          }
        }
      }
      let reqTimeout;
      const cancelRequest = () => {
        if (request.useElectronNet) {
          req.abort();
        } else {
          req.destroy();
        }
      };
      const abortRequest = () => {
        const err = new import_fetch_error.default("request aborted", import_types.FetchErrorType.Abort);
        reject(err);
        cancelRequest();
        req.emit("error", err);
      };
      if (request.signal) {
        request.signal.addEventListener("abort", abortRequest);
      }
      if (request.timeout) {
        reqTimeout = setTimeout(() => {
          const err = new import_fetch_error.default(
            `network timeout at: ${request.url}`,
            import_types.FetchErrorType.RequestTimeout
          );
          reject(err);
          cancelRequest();
        }, request.timeout);
      }
      if (request.useElectronNet) {
        req.on("login", (authInfo, callback) => {
          if (opts.user && opts.password) {
            callback(opts.user, opts.password);
          } else if (opts.onLogin) {
            opts.onLogin(authInfo).then((credentials) => {
              if (credentials) {
                callback(credentials.username, credentials.password);
              } else {
                callback();
              }
            }).catch((error) => {
              cancelRequest();
              reject(error);
            });
          } else {
            cancelRequest();
            reject(
              new import_fetch_error.default(
                `login event received from ${authInfo.host} but no credentials or onLogin handler provided`,
                import_types.FetchErrorType.Proxy,
                { code: "PROXY_AUTH_FAILED" }
              )
            );
          }
        });
      }
      req.on("error", (err) => {
        clearTimeout(reqTimeout);
        if (request.signal) {
          request.signal.removeEventListener("abort", abortRequest);
        }
        reject(
          new import_fetch_error.default(
            `request to ${request.url} failed, reason: ${err.message}`,
            import_types.FetchErrorType.System,
            err
          )
        );
      });
      req.on("abort", () => {
        clearTimeout(reqTimeout);
        if (request.signal) {
          request.signal.removeEventListener("abort", abortRequest);
        }
      });
      req.on("response", (res) => {
        try {
          clearTimeout(reqTimeout);
          if (request.signal) {
            request.signal.removeEventListener("abort", abortRequest);
          }
          if (fetch.isRedirect(res.statusCode) && request.redirect !== "manual") {
            if (request.redirect === "error") {
              reject(
                new import_fetch_error.default(
                  `redirect mode is set to error: ${request.url}`,
                  import_types.FetchErrorType.NoRedirect
                )
              );
              return;
            }
            if (request.counter >= request.follow) {
              reject(
                new import_fetch_error.default(
                  `maximum redirect reached at: ${request.url}`,
                  import_types.FetchErrorType.MaxRedirect
                )
              );
              return;
            }
            if (!res.headers.location) {
              reject(
                new import_fetch_error.default(
                  `redirect location header missing at: ${request.url}`,
                  import_types.FetchErrorType.InvalidRedirect
                )
              );
              return;
            }
            if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === "POST") {
              request.method = "GET";
              request.body = null;
              request.headers && request.headers.delete("content-length");
            }
            request.counter++;
            resolve(
              // @ts-ignore
              fetch((0, import_url.resolve)(request.url, res.headers.location), request)
            );
            return;
          }
          const headers2 = new import_headers.default();
          for (const name of Object.keys(res.headers)) {
            if (Array.isArray(res.headers[name])) {
              for (const val of res.headers[name]) {
                headers2.append(name, val);
              }
            } else {
              headers2.append(name, res.headers[name] || "");
            }
          }
          if (request.redirect === "manual" && headers2.has("location")) {
            headers2.set(
              "location",
              (0, import_url.resolve)(request.url, headers2.get("location") || "")
            );
          }
          let body = new import_stream.PassThrough();
          res.on("error", (err) => body.emit("error", err));
          res.pipe(body);
          body.on("error", cancelRequest);
          body.on("cancel-request", cancelRequest);
          const abortBody = () => {
            res.destroy();
            res.emit(
              "error",
              new import_fetch_error.default("request aborted", import_types.FetchErrorType.Abort)
            );
          };
          if (request.signal) {
            request.signal.addEventListener("abort", abortBody);
            res.on("end", () => {
              request.signal.removeEventListener("abort", abortBody);
            });
            res.on("error", () => {
              request.signal.removeEventListener("abort", abortBody);
            });
          }
          const responseOptions = {
            url: request.url,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: headers2,
            size: request.size,
            timeout: request.timeout,
            useElectronNet: request.useElectronNet,
            useSessionCookies: request.useSessionCookies
          };
          const codings = headers2.get("Content-Encoding");
          if (!request.useElectronNet && request.method !== "HEAD" && codings !== null && res.statusCode !== 204 && res.statusCode !== 304) {
            if (codings === "gzip" || codings === "x-gzip") {
              body = body.pipe(zlib.createGunzip());
            } else if (codings === "deflate" || codings === "x-deflate") {
              const raw = res.pipe(new import_stream.PassThrough());
              return raw.once("data", (chunk) => {
                if ((chunk[0] & 15) === 8) {
                  body = body.pipe(zlib.createInflate());
                } else {
                  body = body.pipe(zlib.createInflateRaw());
                }
                const response2 = new import_response.default(body, responseOptions);
                resolve(response2);
              });
            }
          }
          const response = new import_response.default(body, responseOptions);
          resolve(response);
        } catch (error) {
          reject(
            new import_fetch_error.default(
              `Invalid response: ${error.message}`,
              import_types.FetchErrorType.InvalidRedirect
            )
          );
          cancelRequest();
        }
      });
      (0, import_common.writeToStream)(req, request);
    })
  );
}
fetch.isRedirect = (code) => code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchError,
  Headers,
  Request,
  Response
});
//# sourceMappingURL=index.js.map
