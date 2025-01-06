import { Stream, PassThrough } from "node:stream";
import http from "node:http";
import iconv from "iconv-lite";

import { BodyInit } from "./types.js";
import type Response from "./response.js";
import type Request from "./request.js";

/**
 * Verifies that the given val is a valid HTTP token
 * per the rules defined in RFC 7230
 * See https://tools.ietf.org/html/rfc7230#section-3.2.6
 *
 * Allowed characters in an HTTP token:
 * ^_`a-z  94-122
 * A-Z     65-90
 * -       45
 * 0-9     48-57
 * !       33
 * #$%&'   35-39
 * *+      42-43
 * .       46
 * |       124
 * ~       126
 *
 * This implementation of checkIsHttpToken() loops over the string instead of
 * using a regular expression since the former is up to 180% faster with v8 4.9
 * depending on the string length (the shorter the string, the larger the
 * performance difference)
 *
 * Additionally, checkIsHttpToken() is currently designed to be inlinable by v8,
 * so take care when making changes to the implementation so that the source
 * code size does not exceed v8's default max_inlined_source_size setting.
 **/
function isValidTokenChar(ch: number): boolean {
  if (ch >= 94 && ch <= 122) {
    return true;
  }
  if (ch >= 65 && ch <= 90) {
    return true;
  }
  if (ch === 45) {
    return true;
  }
  if (ch >= 48 && ch <= 57) {
    return true;
  }
  if (ch === 34 || ch === 40 || ch === 41 || ch === 44) {
    return false;
  }
  if (ch >= 33 && ch <= 46) {
    return true;
  }
  if (ch === 124 || ch === 126) {
    return true;
  }
  return false;
}

export function checkIsHttpToken(val: string): boolean {
  if (typeof val !== "string" || val.length === 0) {
    return false;
  }
  if (!isValidTokenChar(val.charCodeAt(0))) {
    return false;
  }
  const len = val.length;
  if (len > 1) {
    if (!isValidTokenChar(val.charCodeAt(1))) {
      return false;
    }
    if (len > 2) {
      if (!isValidTokenChar(val.charCodeAt(2))) {
        return false;
      }
      if (len > 3) {
        if (!isValidTokenChar(val.charCodeAt(3))) {
          return false;
        }
        for (let i = 4; i < len; i++) {
          if (!isValidTokenChar(val.charCodeAt(i))) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

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
export function checkInvalidHeaderChar(val: string): boolean {
  val = String(val);
  if (val.length < 1) {
    return false;
  }
  let c = val.charCodeAt(0);
  if ((c <= 31 && c !== 9) || c > 255 || c === 127) {
    return true;
  }
  if (val.length < 2) {
    return false;
  }
  c = val.charCodeAt(1);
  if ((c <= 31 && c !== 9) || c > 255 || c === 127) {
    return true;
  }
  if (val.length < 3) {
    return false;
  }
  c = val.charCodeAt(2);
  if ((c <= 31 && c !== 9) || c > 255 || c === 127) {
    return true;
  }
  for (let i = 3; i < val.length; ++i) {
    c = val.charCodeAt(i);
    if ((c <= 31 && c !== 9) || c > 255 || c === 127) {
      return true;
    }
  }
  return false;
}

export function sanitizeName(name: string): string {
  name = String(name);
  if (!checkIsHttpToken(name)) {
    throw new TypeError(`${name} is not a legal HTTP header name`);
  }
  return name.toLowerCase();
}

export function sanitizeValue(value: string): string {
  value = String(value);
  if (checkInvalidHeaderChar(value)) {
    throw new TypeError(`${value} is not a legal HTTP header value`);
  }
  return value;
}

/**
 * Converts charset name if needed
 *
 * @param {String} name Character set
 * @return {String} Character set name
 */
function checkEncoding(name: string) {
  return (name || "")
    .toString()
    .trim()
    .replace(/^latin[\-_]?(\d+)$/i, "ISO-8859-$1")
    .replace(/^win(?:dows)?[\-_]?(\d+)$/i, "WINDOWS-$1")
    .replace(/^utf[\-_]?(\d+)$/i, "UTF-$1")
    .replace(/^ks_c_5601\-1987$/i, "CP949")
    .replace(/^us[\-_]?ascii$/i, "ASCII")
    .toUpperCase();
}

/**
 * Convert encoding of an UTF-8 string or a buffer
 *
 * @param {String|Buffer} str String to be converted
 * @param {String} to Encoding to be converted to
 * @param {String} [from='UTF-8'] Encoding to be converted from
 * @return {Buffer} Encoded string
 */
export function convert(
  str: string | Buffer = "",
  to: string,
  from: string
): Buffer {
  from = checkEncoding(from || "UTF-8");
  to = checkEncoding(to || "UTF-8");

  let result;

  if (from !== "UTF-8" && typeof str === "string") {
    str = Buffer.from(str, "binary");
  }

  if (from === to) {
    if (typeof str === "string") {
      result = Buffer.from(str);
    } else {
      result = str;
    }
  } else {
    try {
      if (to === "UTF-8") {
        result = iconv.decode(str as Buffer, from);
      } else if (from === "UTF-8") {
        result = iconv.encode(str as string, to);
      } else {
        result = iconv.encode(iconv.decode(str as Buffer, from), to);
      }
    } catch (err) {
      console.error(err);
      result = str;
    }
  }

  if (typeof result === "string") {
    result = Buffer.from(result, "utf-8");
  }

  return result;
}

/**
 * Clone body given Res/Req instance
 *
 * @param {Response|Request} instance Response or Request instance
 * @return {string|Blob|Buffer|Stream}
 */
export function clone(instance: Response | Request): BodyInit {
  let p1, p2;
  let body = instance.body;

  // don't allow cloning a used body
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }

  // check that body is a stream and not form-data object
  // note: we can't clone the form-data object without having it as a dependency
  if (
    body instanceof Stream &&
    typeof (body as any).getBoundary !== "function"
  ) {
    // tee instance body
    p1 = new PassThrough();
    p2 = new PassThrough();
    body.pipe(p1);
    body.pipe(p2);
    // set instance body to teed body and return the other teed body
    instance.body = p1;
    body = p2;
  }

  return body as BodyInit;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present and non-null.
 *
 * @param {Response|Request} instance Response or Request instance
 */
export function extractContentType(instance: Response | Request) {
  const { body } = instance;

  // istanbul ignore if: Currently, because of a guard in Request, body
  // can never be null. Included here for completeness.
  if (body === null) {
    // body is null
    return null;
  } else if (typeof body === "string") {
    // body is string
    return "text/plain;charset=UTF-8";
  } else if (body instanceof Blob) {
    // body is blob
    return body.type || null;
  } else if (Buffer.isBuffer(body)) {
    // body is buffer
    return null;
    // @ts-ignore
  } else if (typeof body.getBoundary === "function") {
    // detect form data input from form-data module
    // @ts-ignore
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  } else {
    // body is stream
    // can't really do much about this
    return null;
  }
}

export function getTotalBytes(instance: Response | Request) {
  const { body } = instance;

  // istanbul ignore if: included for completion
  if (body === null) {
    // body is null
    return 0;
  } else if (typeof body === "string") {
    // body is string
    return Buffer.byteLength(body);
  } else if (body instanceof Blob) {
    // body is blob
    return body.size;
  } else if (Buffer.isBuffer(body)) {
    // body is buffer
    return body.length;
    // @ts-ignore
  } else if (body && typeof body.getLengthSync === "function") {
    // detect form data input from form-data module
    // istanbul ignore next
    if (
      // @ts-ignore
      (body._lengthRetrievers && body._lengthRetrievers.length === 0) || // 1.x
      // @ts-ignore
      (body.hasKnownLength && body.hasKnownLength())
    ) {
      // 2.x
      // @ts-ignore
      return body.getLengthSync();
    }
    return null;
  } else {
    // body is stream
    // can't really do much about this
    return null;
  }
}

export function writeToStream(
  dest: http.ClientRequest | Electron.ClientRequest,
  instance: Response | Request
) {
  const { body } = instance;

  if (body === null) {
    // body is null
    dest.end();
  } else if (typeof body === "string") {
    // body is string
    dest.write(body);
    dest.end();
  } else if (body instanceof Blob) {
    // body is blob
    // @ts-ignore
    dest.write(body.buffer);
    dest.end();
  } else if (Buffer.isBuffer(body)) {
    // body is buffer
    dest.write(body);
    dest.end();
  } else {
    // body is stream
    // @ts-ignore
    if (instance.useElectronNet) {
      // @ts-ignore
      dest.chunkedEncoding = instance.chunkedEncoding;

      // Force a first write to start the request otherwise an empty body stream
      // will cause an error when closing the dest stream with Electron v7.
      dest.write("");
    }
    body
      // @ts-ignore
      .pipe(new PassThrough()) // I have to put a PassThrough because somehow, FormData streams are not eaten by electron/net
      .pipe(dest);
  }
}

export function getNodeRequestOptions(request: Request) {
  const parsedURL = request.url;
  const headers = new Headers(request.headers);

  // fetch step 3
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }

  // Basic fetch
  // @ts-ignore
  if (!parsedURL.protocol || !parsedURL.hostname) {
    throw new TypeError("Only absolute URLs are supported");
  }

  // @ts-ignore
  if (!/^https?:$/.test(parsedURL.protocol)) {
    throw new TypeError("Only HTTP(S) protocols are supported");
  }

  // HTTP-network-or-cache fetch steps 5-9
  let contentLengthValue = null;
  if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body != null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number") {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    if (!request.useElectronNet)
      headers.set("Content-Length", contentLengthValue);
  } else {
    request.chunkedEncoding = true;
  }

  // HTTP-network-or-cache fetch step 12
  if (!headers.has("User-Agent")) {
    headers.set(
      "User-Agent",
      `electron-fetch/1.0 ${
        request.useElectronNet ? "electron" : "node"
      } (+https://github.com/arantes555/electron-fetch)`
    );
  }

  // HTTP-network-or-cache fetch step 16
  headers.set("Accept-Encoding", "gzip,deflate");

  // HTTP-network fetch step 4
  // chunked encoding is handled by Node.js when not running in electron

  return Object.assign({}, parsedURL, {
    method: request.method,
    // @ts-ignore
    headers: headers.raw(),
  });
}
