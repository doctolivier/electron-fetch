import electron from "electron";
import { resolve as resolveURL } from "url";
import * as http from "http";
import * as https from "https";
import * as zlib from "zlib";
import { PassThrough } from "stream";
import { writeToStream, getNodeRequestOptions } from "./common.js";
import Response from "./response.js";
import Headers from "./headers.js";
import Request from "./request.js";
import FetchError from "./fetch-error.js";
import { FetchErrorType } from "./types.js";
const isReady = electron && electron.app && !electron.app.isReady() ? new Promise((resolve) => electron.app.once("ready", resolve)) : Promise.resolve();
function fetch(url, opts = {}) {
  return isReady.then(
    () => new Promise((resolve, reject) => {
      const request = new Request(url, opts);
      const options = getNodeRequestOptions(request);
      const send = request.useElectronNet ? electron.net.request : (
        // @ts-ignore
        (options.protocol === "https:" ? https : http).request
      );
      if (options.headers.host) {
        options.headers.host = options.headers.host[0];
      }
      if (request.signal && request.signal.aborted) {
        reject(new FetchError("request aborted", FetchErrorType.Abort));
        return;
      }
      let headers;
      if (request.useElectronNet) {
        headers = options.headers;
        delete options.headers;
        options.session = opts.session || electron.session.defaultSession;
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
        const err = new FetchError("request aborted", FetchErrorType.Abort);
        reject(err);
        cancelRequest();
        req.emit("error", err);
      };
      if (request.signal) {
        request.signal.addEventListener("abort", abortRequest);
      }
      if (request.timeout) {
        reqTimeout = setTimeout(() => {
          const err = new FetchError(
            `network timeout at: ${request.url}`,
            FetchErrorType.RequestTimeout
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
              new FetchError(
                `login event received from ${authInfo.host} but no credentials or onLogin handler provided`,
                FetchErrorType.Proxy,
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
          new FetchError(
            `request to ${request.url} failed, reason: ${err.message}`,
            FetchErrorType.System,
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
                new FetchError(
                  `redirect mode is set to error: ${request.url}`,
                  FetchErrorType.NoRedirect
                )
              );
              return;
            }
            if (request.counter >= request.follow) {
              reject(
                new FetchError(
                  `maximum redirect reached at: ${request.url}`,
                  FetchErrorType.MaxRedirect
                )
              );
              return;
            }
            if (!res.headers.location) {
              reject(
                new FetchError(
                  `redirect location header missing at: ${request.url}`,
                  FetchErrorType.InvalidRedirect
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
              fetch(resolveURL(request.url, res.headers.location), request)
            );
            return;
          }
          const headers2 = new Headers();
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
              resolveURL(request.url, headers2.get("location") || "")
            );
          }
          let body = new PassThrough();
          res.on("error", (err) => body.emit("error", err));
          res.pipe(body);
          body.on("error", cancelRequest);
          body.on("cancel-request", cancelRequest);
          const abortBody = () => {
            res.destroy();
            res.emit(
              "error",
              new FetchError("request aborted", FetchErrorType.Abort)
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
              const raw = res.pipe(new PassThrough());
              return raw.once("data", (chunk) => {
                if ((chunk[0] & 15) === 8) {
                  body = body.pipe(zlib.createInflate());
                } else {
                  body = body.pipe(zlib.createInflateRaw());
                }
                const response2 = new Response(body, responseOptions);
                resolve(response2);
              });
            }
          }
          const response = new Response(body, responseOptions);
          resolve(response);
        } catch (error) {
          reject(
            new FetchError(
              `Invalid response: ${error.message}`,
              FetchErrorType.InvalidRedirect
            )
          );
          cancelRequest();
        }
      });
      writeToStream(req, request);
    })
  );
}
fetch.isRedirect = (code) => code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
export {
  FetchError,
  Headers,
  Request,
  Response,
  fetch as default
};
//# sourceMappingURL=index.js.map
