import { Stream, PassThrough } from "node:stream";
import iconv from "iconv-lite";
function isValidTokenChar(ch) {
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
function checkIsHttpToken(val) {
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
function checkInvalidHeaderChar(val) {
  val = String(val);
  if (val.length < 1) {
    return false;
  }
  let c = val.charCodeAt(0);
  if (c <= 31 && c !== 9 || c > 255 || c === 127) {
    return true;
  }
  if (val.length < 2) {
    return false;
  }
  c = val.charCodeAt(1);
  if (c <= 31 && c !== 9 || c > 255 || c === 127) {
    return true;
  }
  if (val.length < 3) {
    return false;
  }
  c = val.charCodeAt(2);
  if (c <= 31 && c !== 9 || c > 255 || c === 127) {
    return true;
  }
  for (let i = 3; i < val.length; ++i) {
    c = val.charCodeAt(i);
    if (c <= 31 && c !== 9 || c > 255 || c === 127) {
      return true;
    }
  }
  return false;
}
function sanitizeName(name) {
  name = String(name);
  if (!checkIsHttpToken(name)) {
    throw new TypeError(`${name} is not a legal HTTP header name`);
  }
  return name.toLowerCase();
}
function sanitizeValue(value) {
  value = String(value);
  if (checkInvalidHeaderChar(value)) {
    throw new TypeError(`${value} is not a legal HTTP header value`);
  }
  return value;
}
function checkEncoding(name) {
  return (name || "").toString().trim().replace(/^latin[\-_]?(\d+)$/i, "ISO-8859-$1").replace(/^win(?:dows)?[\-_]?(\d+)$/i, "WINDOWS-$1").replace(/^utf[\-_]?(\d+)$/i, "UTF-$1").replace(/^ks_c_5601\-1987$/i, "CP949").replace(/^us[\-_]?ascii$/i, "ASCII").toUpperCase();
}
function convert(str = "", to, from) {
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
        result = iconv.decode(str, from);
      } else if (from === "UTF-8") {
        result = iconv.encode(str, to);
      } else {
        result = iconv.encode(iconv.decode(str, from), to);
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
function clone(instance) {
  let p1, p2;
  let body = instance.body;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof Stream && typeof body.getBoundary !== "function") {
    p1 = new PassThrough();
    p2 = new PassThrough();
    body.pipe(p1);
    body.pipe(p2);
    instance.body = p1;
    body = p2;
  }
  return body;
}
function extractContentType(instance) {
  const { body } = instance;
  if (body === null) {
    return null;
  } else if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  } else if (body instanceof Blob) {
    return body.type || null;
  } else if (Buffer.isBuffer(body)) {
    return null;
  } else if (typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  } else {
    return null;
  }
}
function getTotalBytes(instance) {
  const { body } = instance;
  if (body === null) {
    return 0;
  } else if (typeof body === "string") {
    return Buffer.byteLength(body);
  } else if (body instanceof Blob) {
    return body.size;
  } else if (Buffer.isBuffer(body)) {
    return body.length;
  } else if (body && typeof body.getLengthSync === "function") {
    if (
      // @ts-ignore
      body._lengthRetrievers && body._lengthRetrievers.length === 0 || // 1.x
      // @ts-ignore
      body.hasKnownLength && body.hasKnownLength()
    ) {
      return body.getLengthSync();
    }
    return null;
  } else {
    return null;
  }
}
function writeToStream(dest, instance) {
  const { body } = instance;
  if (body === null) {
    dest.end();
  } else if (typeof body === "string") {
    dest.write(body);
    dest.end();
  } else if (body instanceof Blob) {
    dest.write(body.buffer);
    dest.end();
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    if (instance.useElectronNet) {
      dest.chunkedEncoding = instance.chunkedEncoding;
      dest.write("");
    }
    body.pipe(new PassThrough()).pipe(dest);
  }
}
function getNodeRequestOptions(request) {
  const parsedURL = request.url;
  const headers = new Headers(request.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  if (!parsedURL.protocol || !parsedURL.hostname) {
    throw new TypeError("Only absolute URLs are supported");
  }
  if (!/^https?:$/.test(parsedURL.protocol)) {
    throw new TypeError("Only HTTP(S) protocols are supported");
  }
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
  if (!headers.has("User-Agent")) {
    headers.set(
      "User-Agent",
      `electron-fetch/1.0 ${request.useElectronNet ? "electron" : "node"} (+https://github.com/arantes555/electron-fetch)`
    );
  }
  headers.set("Accept-Encoding", "gzip,deflate");
  return Object.assign({}, parsedURL, {
    method: request.method,
    // @ts-ignore
    headers: headers.raw()
  });
}
export {
  checkInvalidHeaderChar,
  checkIsHttpToken,
  clone,
  convert,
  extractContentType,
  getNodeRequestOptions,
  getTotalBytes,
  sanitizeName,
  sanitizeValue,
  writeToStream
};
//# sourceMappingURL=common.js.map
