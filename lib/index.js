'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var url = require('url');
var http = require('http');
var https = require('https');
var zlib = require('zlib');
var Stream = require('stream');
var electron = require('electron');
var encoding = require('encoding');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var http__namespace = /*#__PURE__*/_interopNamespace(http);
var https__namespace = /*#__PURE__*/_interopNamespace(https);
var zlib__namespace = /*#__PURE__*/_interopNamespace(zlib);
var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);
var electron__default = /*#__PURE__*/_interopDefaultLegacy(electron);

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);

  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }

  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)
const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');
const CLOSED = Symbol('closed');
class Blob {
  constructor() {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true
    });
    this[CLOSED] = false;
    this[TYPE] = '';
    const blobParts = arguments[0];
    const options = arguments[1];
    const buffers = [];

    if (blobParts) {
      const a = blobParts;
      const length = Number(a.length);

      for (let i = 0; i < length; i++) {
        const element = a[i];
        let buffer;

        if (element instanceof Buffer) {
          buffer = element;
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(new Uint8Array(element.buffer, element.byteOffset, element.byteLength));
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(new Uint8Array(element));
        } else if (element instanceof Blob) {
          buffer = element[BUFFER];
        } else {
          buffer = Buffer.from(typeof element === 'string' ? element : String(element));
        }

        buffers.push(buffer);
      }
    }

    this[BUFFER] = Buffer.concat(buffers);
    const type = options && options.type !== undefined && String(options.type).toLowerCase();

    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type;
    }
  }

  get size() {
    return this[CLOSED] ? 0 : this[BUFFER].length;
  }

  get type() {
    return this[TYPE];
  }

  get isClosed() {
    return this[CLOSED];
  }

  slice() {
    const size = this.size;
    const start = arguments[0];
    const end = arguments[1];
    let relativeStart, relativeEnd;

    if (start === undefined) {
      relativeStart = 0;
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0);
    } else {
      relativeStart = Math.min(start, size);
    }

    if (end === undefined) {
      relativeEnd = size;
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0);
    } else {
      relativeEnd = Math.min(end, size);
    }

    const span = Math.max(relativeEnd - relativeStart, 0);
    const buffer = this[BUFFER];
    const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
    const blob = new Blob([], {
      type: arguments[2]
    });
    blob[BUFFER] = slicedBuffer;
    blob[CLOSED] = this[CLOSED];
    return blob;
  }

  close() {
    this[CLOSED] = true;
  }

}
Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'BlobPrototype',
  writable: false,
  enumerable: false,
  configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param {string} message Error message for human
 * @param {string} type Error type for machine
 * @param {string} systemError For Node.js system error
 * @return {FetchError}
 */
const netErrorMap = {
  ERR_CONNECTION_REFUSED: 'ECONNREFUSED',
  ERR_EMPTY_RESPONSE: 'ECONNRESET',
  ERR_NAME_NOT_RESOLVED: 'ENOTFOUND',
  ERR_CONTENT_DECODING_FAILED: 'Z_DATA_ERROR',
  ERR_CONTENT_DECODING_INIT_FAILED: 'Z_DATA_ERROR'
};
function FetchError(message, type, systemError) {
  Error.call(this, message);
  const regex = /^.*net::(.*)/;

  if (regex.test(message)) {
    let errorCode = regex.exec(message)[1]; // istanbul ignore else

    if (Object.prototype.hasOwnProperty.call(netErrorMap, errorCode)) errorCode = netErrorMap[errorCode];
    systemError = {
      code: errorCode
    };
  }

  this.message = message;
  this.type = type; // when err.type is `system`, err.code contains system error code

  if (systemError) {
    this.code = this.errno = systemError.code;
  } // hide custom error implementation details from end-users


  Error.captureStackTrace(this, this.constructor);
}
FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

const DISTURBED = Symbol('disturbed');
/**
 * Body class
 *
 * Cannot use ES6 class because Body must be called with .call().
 *
 * @param {Stream|string|Blob|Buffer|null} body Readable stream
 * @param {number} size
 * @param {number} timeout
 */

function Body(body, {
  size = 0,
  timeout = 0
} = {}) {
  if (body == null) {
    // body is undefined or null
    body = null;
  } else if (typeof body === 'string') ; else if (body instanceof Blob) ; else if (Buffer.isBuffer(body)) ; else if (body instanceof Stream__default["default"]) ; else {
    // none of the above
    // coerce to string
    body = String(body);
  }

  this.body = body;
  this[DISTURBED] = false;
  this.size = size;
  this.timeout = timeout;
}
Body.prototype = {
  get bodyUsed() {
    return this[DISTURBED];
  },

  /**
   * Decode response as ArrayBuffer
   *
   * @return {Promise}
   */
  arrayBuffer() {
    return consumeBody.call(this).then(buf => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  },

  /**
   * Return raw response as Blob
   *
   * @return {Promise}
   */
  blob() {
    const ct = this.headers && this.headers.get('content-type') || '';
    return consumeBody.call(this).then(buf => Object.assign( // Prevent copying
    new Blob([], {
      type: ct.toLowerCase()
    }), {
      [BUFFER]: buf
    }));
  },

  /**
   * Decode response as json
   *
   * @return {Promise}
   */
  json() {
    return consumeBody.call(this).then(buffer => JSON.parse(buffer.toString()));
  },

  /**
   * Decode response as text
   *
   * @return {Promise}
   */
  text() {
    return consumeBody.call(this).then(buffer => buffer.toString());
  },

  /**
   * Decode response as buffer (non-spec api)
   *
   * @return {Promise}
   */
  buffer() {
    return consumeBody.call(this);
  },

  /**
   * Decode response as text, while automatically detecting the encoding and
   * trying to decode to UTF-8 (non-spec api)
   *
   * @return {Promise}
   */
  textConverted() {
    return consumeBody.call(this).then(buffer => convertBody(buffer, this.headers));
  }

};

Body.mixIn = function (proto) {
  for (var _iterator = _createForOfIteratorHelperLoose(Object.getOwnPropertyNames(Body.prototype)), _step; !(_step = _iterator()).done;) {
    const name = _step.value;

    // istanbul ignore else
    if (!(name in proto)) {
      const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
      Object.defineProperty(proto, name, desc);
    }
  }
};
/**
 * Decode buffers into utf-8 string
 *
 * @return {Promise}
 */


function consumeBody() {
  if (this[DISTURBED]) {
    return Promise.reject(new Error(`body used already for: ${this.url}`));
  }

  this[DISTURBED] = true; // body is null

  if (this.body === null) {
    return Promise.resolve(Buffer.alloc(0));
  } // body is string


  if (typeof this.body === 'string') {
    return Promise.resolve(Buffer.from(this.body));
  } // body is blob


  if (this.body instanceof Blob) {
    return Promise.resolve(this.body[BUFFER]);
  } // body is buffer


  if (Buffer.isBuffer(this.body)) {
    return Promise.resolve(this.body);
  } // istanbul ignore if: should never happen


  if (!(this.body instanceof Stream__default["default"])) {
    return Promise.resolve(Buffer.alloc(0));
  } // body is stream
  // get ready to actually consume the body


  const accum = [];
  let accumBytes = 0;
  let abort = false;
  return new Promise((resolve, reject) => {
    let resTimeout; // allow timeout on slow response body

    if (this.timeout) {
      resTimeout = setTimeout(() => {
        abort = true;
        reject(new FetchError(`Response timeout while trying to fetch ${this.url} (over ${this.timeout}ms)`, 'body-timeout'));
        this.body.emit('cancel-request');
      }, this.timeout);
    } // handle stream error, such as incorrect content-encoding


    this.body.on('error', err => {
      reject(new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, 'system', err));
    });
    this.body.on('data', chunk => {
      if (abort || chunk === null) {
        return;
      }

      if (this.size && accumBytes + chunk.length > this.size) {
        abort = true;
        reject(new FetchError(`content size at ${this.url} over limit: ${this.size}`, 'max-size'));
        this.body.emit('cancel-request');
        return;
      }

      accumBytes += chunk.length;
      accum.push(chunk);
    });
    this.body.on('end', () => {
      if (abort) {
        return;
      }

      clearTimeout(resTimeout);
      resolve(Buffer.concat(accum));
    });
  });
}
/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param {Buffer} buffer   Incoming buffer
 * @param {Headers} headers
 * @return {string}
 */


function convertBody(buffer, headers) {
  const ct = headers.get('content-type');
  let charset = 'utf-8';
  let res; // header

  if (ct) {
    res = /charset=([^;]*)/i.exec(ct);
  } // no charset in content type, peek at response body for at most 1024 bytes


  const str = buffer.slice(0, 1024).toString(); // html5

  if (!res && str) {
    res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
  } // html4


  if (!res && str) {
    res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

    if (res) {
      res = /charset=(.*)/i.exec(res.pop());
    }
  } // xml


  if (!res && str) {
    res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
  } // found charset


  if (res) {
    charset = res.pop(); // prevent decode issues when sites use incorrect encoding
    // ref: https://hsivonen.fi/encoding-menu/

    if (charset === 'gb2312' || charset === 'gbk') {
      charset = 'gb18030';
    }
  } // turn raw buffers into a single utf-8 buffer


  return encoding.convert(buffer, 'UTF-8', charset).toString();
}
/**
 * Clone body given Res/Req instance
 *
 * @param {Response|Request} instance Response or Request instance
 * @return {string|Blob|Buffer|Stream}
 */


function clone(instance) {
  let p1, p2;
  let body = instance.body; // don't allow cloning a used body

  if (instance.bodyUsed) {
    throw new Error('cannot clone body after it is used');
  } // check that body is a stream and not form-data object
  // note: we can't clone the form-data object without having it as a dependency


  if (body instanceof Stream__default["default"] && typeof body.getBoundary !== 'function') {
    // tee instance body
    p1 = new Stream.PassThrough();
    p2 = new Stream.PassThrough();
    body.pipe(p1);
    body.pipe(p2); // set instance body to teed body and return the other teed body

    instance.body = p1;
    body = p2;
  }

  return body;
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

function extractContentType(instance) {
  const body = instance.body; // istanbul ignore if: Currently, because of a guard in Request, body
  // can never be null. Included here for completeness.

  if (body === null) {
    // body is null
    return null;
  } else if (typeof body === 'string') {
    // body is string
    return 'text/plain;charset=UTF-8';
  } else if (body instanceof Blob) {
    // body is blob
    return body.type || null;
  } else if (Buffer.isBuffer(body)) {
    // body is buffer
    return null;
  } else if (typeof body.getBoundary === 'function') {
    // detect form data input from form-data module
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  } else {
    // body is stream
    // can't really do much about this
    return null;
  }
}
function getTotalBytes(instance) {
  const body = instance.body; // istanbul ignore if: included for completion

  if (body === null) {
    // body is null
    return 0;
  } else if (typeof body === 'string') {
    // body is string
    return Buffer.byteLength(body);
  } else if (body instanceof Blob) {
    // body is blob
    return body.size;
  } else if (Buffer.isBuffer(body)) {
    // body is buffer
    return body.length;
  } else if (body && typeof body.getLengthSync === 'function') {
    // detect form data input from form-data module
    // istanbul ignore next
    if (body._lengthRetrievers && body._lengthRetrievers.length === 0 || // 1.x
    body.hasKnownLength && body.hasKnownLength()) {
      // 2.x
      return body.getLengthSync();
    }

    return null;
  } else {
    // body is stream
    // can't really do much about this
    return null;
  }
}
function writeToStream(dest, instance) {
  const body = instance.body;

  if (body === null) {
    // body is null
    dest.end();
  } else if (typeof body === 'string') {
    // body is string
    dest.write(body);
    dest.end();
  } else if (body instanceof Blob) {
    // body is blob
    dest.write(body[BUFFER]);
    dest.end();
  } else if (Buffer.isBuffer(body)) {
    // body is buffer
    dest.write(body);
    dest.end();
  } else {
    // body is stream
    if (instance.useElectronNet) {
      dest.chunkedEncoding = instance.chunkedEncoding; // Force a first write to start the request otherwise an empty body stream
      // will cause an error when closing the dest stream with Electron v7.

      dest.write('');
    }

    body.pipe(new Stream.PassThrough()) // I have to put a PassThrough because somehow, FormData streams are not eaten by electron/net
    .pipe(dest);
  }
}

/**
 * A set of utilities borrowed from Node.js' _http_common.js
 */

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
// istanbul ignore next
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
} // istanbul ignore next


function checkIsHttpToken(val) {
  if (typeof val !== 'string' || val.length === 0) {
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
// istanbul ignore next

function checkInvalidHeaderChar(val) {
  val += '';

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
  name += '';

  if (!checkIsHttpToken(name)) {
    throw new TypeError(`${name} is not a legal HTTP header name`);
  }

  return name.toLowerCase();
}

function sanitizeValue(value) {
  value += '';

  if (checkInvalidHeaderChar(value)) {
    throw new TypeError(`${value} is not a legal HTTP header value`);
  }

  return value;
}

const MAP = Symbol('map');
class Headers {
  /**
   * Headers class
   *
   * @param {Object} init Response headers
   */
  constructor(init = undefined) {
    this[MAP] = Object.create(null); // We don't worry about converting prop to ByteString here as append()
    // will handle it.

    if (init == null) ; else if (typeof init === 'object') {
      const method = init[Symbol.iterator];

      if (method != null) {
        if (typeof method !== 'function') {
          throw new TypeError('Header pairs must be iterable');
        } // sequence<sequence<ByteString>>
        // Note: per spec we have to first exhaust the lists then process them


        const pairs = [];

        for (var _iterator = _createForOfIteratorHelperLoose(init), _step; !(_step = _iterator()).done;) {
          const pair = _step.value;

          if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
            throw new TypeError('Each header pair must be iterable');
          }

          pairs.push(Array.from(pair));
        }

        for (var _i = 0, _pairs = pairs; _i < _pairs.length; _i++) {
          const pair = _pairs[_i];

          if (pair.length !== 2) {
            throw new TypeError('Each header pair must be a name/value tuple');
          }

          this.append(pair[0], pair[1]);
        }
      } else {
        // record<ByteString, ByteString>
        for (var _i2 = 0, _Object$keys = Object.keys(init); _i2 < _Object$keys.length; _i2++) {
          const key = _Object$keys[_i2];
          const value = init[key];
          this.append(key, value);
        }
      }
    } else {
      throw new TypeError('Provided initializer must be an object');
    }

    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Headers',
      writable: false,
      enumerable: false,
      configurable: true
    });
  }
  /**
   * Return first header value given name
   *
   * @param {string} name Header name
   * @return {string}
   */


  get(name) {
    const list = this[MAP][sanitizeName(name)];

    if (!list) {
      return null;
    }

    return list.join(',');
  }
  /**
   * Iterate over all headers
   *
   * @param {function} callback Executed for each item with parameters (value, name, thisArg)
   * @param {boolean} thisArg `this` context for callback function
   */


  forEach(callback, thisArg = undefined) {
    let pairs = getHeaderPairs(this);
    let i = 0;

    while (i < pairs.length) {
      const _pairs$i = pairs[i],
            name = _pairs$i[0],
            value = _pairs$i[1];
      callback.call(thisArg, value, name, this);
      pairs = getHeaderPairs(this);
      i++;
    }
  }
  /**
   * Overwrite header values given name
   *
   * @param {string} name Header name
   * @param {string|Array.<string|*>|*} value Header value
   */


  set(name, value) {
    this[MAP][sanitizeName(name)] = [sanitizeValue(value)];
  }
  /**
   * Append a value onto existing header
   *
   * @param {string} name Header name
   * @param {string|Array.<string|*>|*} value Header value
   */


  append(name, value) {
    if (!this.has(name)) {
      this.set(name, value);
      return;
    }

    this[MAP][sanitizeName(name)].push(sanitizeValue(value));
  }
  /**
   * Check for header name existence
   *
   * @param {string} name Header name
   * @return {boolean}
   */


  has(name) {
    return !!this[MAP][sanitizeName(name)];
  }
  /**
   * Delete all header values given name
   *
   * @param {string} name Header name
   */


  delete(name) {
    delete this[MAP][sanitizeName(name)];
  }
  /**
   * Return raw headers (non-spec api)
   *
   * @return {Object}
   */


  raw() {
    return this[MAP];
  }
  /**
   * Get an iterator on keys.
   *
   * @return {Iterator}
   */


  keys() {
    return createHeadersIterator(this, 'key');
  }
  /**
   * Get an iterator on values.
   *
   * @return {Iterator}
   */


  values() {
    return createHeadersIterator(this, 'value');
  }
  /**
   * Get an iterator on entries.
   *
   * This is the default iterator of the Headers object.
   *
   * @return {Iterator}
   */


  [Symbol.iterator]() {
    return createHeadersIterator(this, 'key+value');
  }

}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];
Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
  value: 'HeadersPrototype',
  writable: false,
  enumerable: false,
  configurable: true
});

function getHeaderPairs(headers, kind) {
  if (kind === 'key') return Object.keys(headers[MAP]).sort().map(k => [k]);
  const pairs = [];

  for (var _iterator2 = _createForOfIteratorHelperLoose(Object.keys(headers[MAP]).sort()), _step2; !(_step2 = _iterator2()).done;) {
    const key = _step2.value;

    for (var _iterator3 = _createForOfIteratorHelperLoose(headers[MAP][key]), _step3; !(_step3 = _iterator3()).done;) {
      const value = _step3.value;
      pairs.push([key, value]);
    }
  }

  return pairs;
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
  const iterator = Object.create(HeadersIteratorPrototype);
  iterator[INTERNAL] = {
    target,
    kind,
    index: 0
  };
  return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
  next() {
    // istanbul ignore if
    if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
      throw new TypeError('Value of `this` is not a HeadersIterator');
    }

    const _this$INTERNAL = this[INTERNAL],
          target = _this$INTERNAL.target,
          kind = _this$INTERNAL.kind,
          index = _this$INTERNAL.index;
    const values = getHeaderPairs(target, kind);
    const len = values.length;

    if (index >= len) {
      return {
        value: undefined,
        done: true
      };
    }

    const pair = values[index];
    this[INTERNAL].index = index + 1;
    let result;

    if (kind === 'key') {
      result = pair[0];
    } else if (kind === 'value') {
      result = pair[1];
    } else {
      result = pair;
    }

    return {
      value: result,
      done: false
    };
  }

}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));
Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
  value: 'HeadersIterator',
  writable: false,
  enumerable: false,
  configurable: true
});

/**
 * response.js
 *
 * Response class provides content decoding
 */
/**
 * Response class
 *
 * @param {Stream} body Readable stream
 * @param {Object} opts Response options
 */

class Response {
  constructor(body = null, opts = {}) {
    Body.call(this, body, opts);
    this.url = opts.url;
    this.status = opts.status || 200;
    this.statusText = opts.statusText || http.STATUS_CODES[this.status];
    this.headers = new Headers(opts.headers);
    this.useElectronNet = opts.useElectronNet;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Response',
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
Body.mixIn(Response.prototype);
Object.defineProperty(Response.prototype, Symbol.toStringTag, {
  value: 'ResponsePrototype',
  writable: false,
  enumerable: false,
  configurable: true
});

/**
 * request.js
 *
 * Request class contains server only options
 */
const PARSED_URL = Symbol('url');
/**
 * Request class
 *
 * @param {string|Request} input Url or Request instance
 * @param {Object} init Custom options
 */

class Request {
  constructor(input, init = {}) {
    let parsedURL; // normalize input

    if (!(input instanceof Request)) {
      if (input && input.href) {
        // in order to support Node.js' Url objects; though WHATWG's URL objects
        // will fall into this branch also (since their `toString()` will return
        // `href` property anyway)
        parsedURL = url.parse(input.href);
      } else {
        // coerce input to a string before attempting to parse
        parsedURL = url.parse(`${input}`);
      }

      input = {};
    } else {
      parsedURL = url.parse(input.url);
    }

    const method = init.method || input.method || 'GET';

    if ((init.body != null || input instanceof Request && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
      throw new TypeError('Request with GET/HEAD method cannot have body');
    }

    const inputBody = init.body != null ? init.body : input instanceof Request && input.body !== null ? clone(input) : null;
    Body.call(this, inputBody, {
      timeout: init.timeout || input.timeout || 0,
      size: init.size || input.size || 0
    }); // fetch spec options

    this.method = method.toUpperCase();
    this.redirect = init.redirect || input.redirect || 'follow';
    this.signal = init.signal || input.signal || null;
    this.headers = new Headers(init.headers || input.headers || {});
    this.headers.delete('Content-Length'); // user cannot set content-length themself as per fetch spec

    this.chunkedEncoding = false;
    this.useElectronNet = init.useElectronNet !== undefined // have to do this instead of || because it can be set to false
    ? init.useElectronNet : input.useElectronNet; // istanbul ignore if

    if (this.useElectronNet && !process.versions.electron) throw new Error('Cannot use Electron/net module on Node.js!');

    if (this.useElectronNet === undefined) {
      this.useElectronNet = Boolean(process.versions.electron);
    }

    if (this.useElectronNet) {
      this.useSessionCookies = init.useSessionCookies !== undefined ? init.useSessionCookies : input.useSessionCookies;
    }

    if (init.body != null) {
      const contentType = extractContentType(this);

      if (contentType !== null && !this.headers.has('Content-Type')) {
        this.headers.append('Content-Type', contentType);
      }
    } // server only options


    this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
    this.counter = init.counter || input.counter || 0;
    this.session = init.session || input.session;
    this[PARSED_URL] = parsedURL;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Request',
      writable: false,
      enumerable: false,
      configurable: true
    });
  }

  get url() {
    return url.format(this[PARSED_URL]);
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
Body.mixIn(Request.prototype);
Object.defineProperty(Request.prototype, Symbol.toStringTag, {
  value: 'RequestPrototype',
  writable: false,
  enumerable: false,
  configurable: true
});
function getNodeRequestOptions(request) {
  const parsedURL = request[PARSED_URL];
  const headers = new Headers(request.headers); // fetch step 3

  if (!headers.has('Accept')) {
    headers.set('Accept', '*/*');
  } // Basic fetch


  if (!parsedURL.protocol || !parsedURL.hostname) {
    throw new TypeError('Only absolute URLs are supported');
  }

  if (!/^https?:$/.test(parsedURL.protocol)) {
    throw new TypeError('Only HTTP(S) protocols are supported');
  } // HTTP-network-or-cache fetch steps 5-9


  let contentLengthValue = null;

  if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
    contentLengthValue = '0';
  }

  if (request.body != null) {
    const totalBytes = getTotalBytes(request);

    if (typeof totalBytes === 'number') {
      contentLengthValue = String(totalBytes);
    }
  }

  if (contentLengthValue) {
    if (!request.useElectronNet) headers.set('Content-Length', contentLengthValue);
  } else {
    request.chunkedEncoding = true;
  } // HTTP-network-or-cache fetch step 12


  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', `electron-fetch/1.0 ${request.useElectronNet ? 'electron' : 'node'} (+https://github.com/arantes555/electron-fetch)`);
  } // HTTP-network-or-cache fetch step 16


  headers.set('Accept-Encoding', 'gzip,deflate'); // HTTP-network fetch step 4
  // chunked encoding is handled by Node.js when not running in electron

  return Object.assign({}, parsedURL, {
    method: request.method,
    headers: headers.raw()
  });
}

const isReady = electron__default["default"] && electron__default["default"].app && !electron__default["default"].app.isReady() ? new Promise(resolve => electron__default["default"].app.once("ready", resolve)) : Promise.resolve();
/**
 * Fetch function
 *
 * @param {string|Request} url Absolute url or Request instance
 * @param {Object} [opts] Fetch options
 * @return {Promise}
 */

function fetch(url$1, opts = {}) {
  // wrap http.request into fetch
  return isReady.then(() => new Promise((resolve, reject) => {
    // build request object
    const request = new Request(url$1, opts);
    const options = getNodeRequestOptions(request);
    const send = request.useElectronNet ? electron__default["default"].net.request : (options.protocol === "https:" ? https__namespace : http__namespace).request; // http.request only support string as host header, this hack make custom host header possible

    if (options.headers.host) {
      options.headers.host = options.headers.host[0];
    }

    if (request.signal && request.signal.aborted) {
      reject(new FetchError("request aborted", "abort"));
      return;
    } // send request


    let headers;

    if (request.useElectronNet) {
      headers = options.headers;
      delete options.headers;
      options.session = opts.session || electron__default["default"].session.defaultSession;
      options.useSessionCookies = request.useSessionCookies;
    } else {
      if (opts.agent) options.agent = opts.agent;
      if (opts.onLogin) reject(new Error('"onLogin" option is only supported with "useElectronNet" enabled'));
    }

    const req = send(options);

    if (request.useElectronNet) {
      for (const headerName in headers) {
        if (typeof headers[headerName] === "string") req.setHeader(headerName, headers[headerName]);else {
          for (var _iterator = _createForOfIteratorHelperLoose(headers[headerName]), _step; !(_step = _iterator()).done;) {
            const headerValue = _step.value;
            req.setHeader(headerName, headerValue);
          }
        }
      }
    }

    let reqTimeout;

    const cancelRequest = () => {
      if (request.useElectronNet) {
        req.abort(); // in electron, `req.destroy()` does not send abort to server
      } else {
        req.destroy(); // in node.js, `req.abort()` is deprecated
      }
    };

    const abortRequest = () => {
      const err = new FetchError("request aborted", "abort");
      reject(err);
      cancelRequest();
      req.emit("error", err);
    };

    if (request.signal) {
      request.signal.addEventListener("abort", abortRequest);
    }

    if (request.timeout) {
      reqTimeout = setTimeout(() => {
        const err = new FetchError(`network timeout at: ${request.url}`, "request-timeout");
        reject(err);
        cancelRequest();
      }, request.timeout);
    }

    if (request.useElectronNet) {
      // handle authenticating proxies
      req.on("login", (authInfo, callback) => {
        if (opts.user && opts.password) {
          callback(opts.user, opts.password);
        } else if (opts.onLogin) {
          opts.onLogin(authInfo).then(credentials => {
            if (credentials) {
              callback(credentials.username, credentials.password);
            } else {
              callback();
            }
          }).catch(error => {
            cancelRequest();
            reject(error);
          });
        } else {
          cancelRequest();
          reject(new FetchError(`login event received from ${authInfo.host} but no credentials or onLogin handler provided`, "proxy", {
            code: "PROXY_AUTH_FAILED"
          }));
        }
      });
    }

    req.on("error", err => {
      clearTimeout(reqTimeout);

      if (request.signal) {
        request.signal.removeEventListener("abort", abortRequest);
      }

      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
    });
    req.on("abort", () => {
      clearTimeout(reqTimeout);

      if (request.signal) {
        request.signal.removeEventListener("abort", abortRequest);
      }
    });
    req.on("response", res => {
      try {
        clearTimeout(reqTimeout);

        if (request.signal) {
          request.signal.removeEventListener("abort", abortRequest);
        } // handle redirect


        if (fetch.isRedirect(res.statusCode) && request.redirect !== "manual") {
          if (request.redirect === "error") {
            reject(new FetchError(`redirect mode is set to error: ${request.url}`, "no-redirect"));
            return;
          }

          if (request.counter >= request.follow) {
            reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
            return;
          }

          if (!res.headers.location) {
            reject(new FetchError(`redirect location header missing at: ${request.url}`, "invalid-redirect"));
            return;
          } // per fetch spec, for POST request with 301/302 response, or any request with 303 response, use GET when following redirect


          if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === "POST") {
            request.method = "GET";
            request.body = null;
            request.headers.delete("content-length");
          }

          request.counter++;
          resolve(fetch(url.resolve(request.url, res.headers.location), request));
          return;
        } // normalize location header for manual redirect mode


        const headers = new Headers();

        for (var _i = 0, _Object$keys = Object.keys(res.headers); _i < _Object$keys.length; _i++) {
          const name = _Object$keys[_i];

          if (Array.isArray(res.headers[name])) {
            for (var _iterator2 = _createForOfIteratorHelperLoose(res.headers[name]), _step2; !(_step2 = _iterator2()).done;) {
              const val = _step2.value;
              headers.append(name, val);
            }
          } else {
            headers.append(name, res.headers[name]);
          }
        }

        if (request.redirect === "manual" && headers.has("location")) {
          headers.set("location", url.resolve(request.url, headers.get("location")));
        } // prepare response


        let body = new Stream.PassThrough();
        res.on("error", err => body.emit("error", err));
        res.pipe(body);
        body.on("error", cancelRequest);
        body.on("cancel-request", cancelRequest);

        const abortBody = () => {
          res.destroy();
          res.emit("error", new FetchError("request aborted", "abort")); // separated from the `.destroy()` because somehow Node's IncomingMessage streams do not emit errors on destroy
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
          headers,
          size: request.size,
          timeout: request.timeout,
          useElectronNet: request.useElectronNet,
          useSessionCookies: request.useSessionCookies
        }; // HTTP-network fetch step 16.1.2

        const codings = headers.get("Content-Encoding"); // HTTP-network fetch step 16.1.3: handle content codings
        // in following scenarios we ignore compression support
        // 1. running on Electron/net module (it manages it for us)
        // 2. HEAD request
        // 3. no Content-Encoding header
        // 4. no content response (204)
        // 5. content not modified response (304)

        if (!request.useElectronNet && request.method !== "HEAD" && codings !== null && res.statusCode !== 204 && res.statusCode !== 304) {
          // Be less strict when decoding compressed responses, since sometimes
          // servers send slightly invalid responses that are still accepted
          // by common browsers.
          // Always using Z_SYNC_FLUSH is what cURL does.
          // /!\ This is disabled for now, because it seems broken in recent node
          // const zlibOptions = {
          //   flush: zlib.Z_SYNC_FLUSH,
          //   finishFlush: zlib.Z_SYNC_FLUSH
          // }
          if (codings === "gzip" || codings === "x-gzip") {
            // for gzip
            body = body.pipe(zlib__namespace.createGunzip());
          } else if (codings === "deflate" || codings === "x-deflate") {
            // for deflate
            // handle the infamous raw deflate response from old servers
            // a hack for old IIS and Apache servers
            const raw = res.pipe(new Stream.PassThrough());
            return raw.once("data", chunk => {
              // see http://stackoverflow.com/questions/37519828
              if ((chunk[0] & 0x0f) === 0x08) {
                body = body.pipe(zlib__namespace.createInflate());
              } else {
                body = body.pipe(zlib__namespace.createInflateRaw());
              }

              const response = new Response(body, responseOptions);
              resolve(response);
            });
          }
        }

        const response = new Response(body, responseOptions);
        resolve(response);
      } catch (error) {
        reject(new FetchError(`Invalid response: ${error.message}`, "invalid-response"));
        cancelRequest();
      }
    });
    writeToStream(req, request);
  }));
}
/**
 * Redirect code matching
 *
 * @param {number} code Status code
 * @return {boolean}
 */

fetch.isRedirect = code => code === 301 || code === 302 || code === 303 || code === 307 || code === 308;

exports.FetchError = FetchError;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports["default"] = fetch;
