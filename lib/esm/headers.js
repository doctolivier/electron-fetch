import { sanitizeName, sanitizeValue } from "./common.js";
const INTERNAL = Symbol("internal");
class Headers {
  list;
  constructor(init) {
    this.list = /* @__PURE__ */ Object.create(null);
    if (!init) {
    } else if (init instanceof Headers) {
      for (const [name, value] of init) {
        this.append(name, value);
      }
    } else if (typeof init === "object" && Symbol.iterator in init) {
      for (const pair of init) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new TypeError("Each header pair must be a name/value tuple");
        }
        this.append(pair[0], pair[1]);
      }
    } else if (typeof init === "object") {
      for (const [name, value] of Object.entries(init)) {
        this.append(name, value);
      }
    } else {
      throw new TypeError("Provided initializer must be an object");
    }
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Headers",
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
    const list = this.list[sanitizeName(name)];
    if (!list) {
      return null;
    }
    return list.join(",");
  }
  /**
   * Iterate over all headers
   *
   * @param {function} callback Executed for each item with parameters (value, name, thisArg)
   * @param {boolean} thisArg `this` context for callback function
   */
  forEach(callback, thisArg = void 0) {
    let pairs = getHeaderPairs(this);
    let i = 0;
    while (i < pairs.length) {
      const pair = pairs[i];
      if (!pair) {
        continue;
      }
      const [name, value] = pair;
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
    this.list[sanitizeName(name)] = [sanitizeValue(value)];
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
    this.list[sanitizeName(name)]?.push(sanitizeValue(value));
  }
  /**
   * Check for header name existence
   *
   * @param {string} name Header name
   * @return {boolean}
   */
  has(name) {
    return !!this.list[sanitizeName(name)];
  }
  /**
   * Delete all header values given name
   *
   * @param {string} name Header name
   */
  delete(name) {
    delete this.list[sanitizeName(name)];
  }
  /**
   * Return raw headers (non-spec api)
   *
   * @return {Object}
   */
  raw() {
    return this.list;
  }
  /**
   * Get an iterator on keys.
   *
   * @return {Iterator}
   */
  keys() {
    return createHeadersIterator(this, "key");
  }
  /**
   * Get an iterator on values.
   *
   * @return {Iterator}
   */
  values() {
    return createHeadersIterator(this, "value");
  }
  /**
   * Get an iterator on entries.
   *
   * This is the default iterator of the Headers object.
   *
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return createHeadersIterator(this, "key+value");
  }
  entries() {
    return this[Symbol.iterator]();
  }
  getSetCookie() {
    const cookies = this.get("Set-Cookie");
    return cookies ? cookies.split(/,\s*/) : [];
  }
}
function getHeaderPairs(headers, kind) {
  if (kind === "key")
    return Object.keys(headers.raw()).sort().map((k) => [k]);
  const pairs = [];
  for (const key of Object.keys(headers.raw()).sort()) {
    for (const value of headers.list[key] || "") {
      pairs.push([key, value]);
    }
  }
  return pairs;
}
function createHeadersIterator(target, kind) {
  const iterator = Object.create(HeadersIteratorPrototype);
  iterator[INTERNAL] = {
    target,
    kind,
    index: 0
  };
  return iterator;
}
const HeadersIteratorPrototype = Object.setPrototypeOf(
  {
    next() {
      if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
        throw new TypeError("Value of `this` is not a HeadersIterator");
      }
      const { target, kind, index } = this[INTERNAL];
      const values = getHeaderPairs(target, kind);
      const len = values.length;
      if (index >= len) {
        return {
          value: void 0,
          done: true
        };
      }
      const pair = values[index] || [];
      this[INTERNAL].index = index + 1;
      let result;
      if (kind === "key") {
        result = pair[0];
      } else if (kind === "value") {
        result = pair[1];
      } else {
        result = pair;
      }
      return {
        value: result,
        done: false
      };
    }
  },
  Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
);
Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
  value: "HeadersIterator",
  writable: false,
  enumerable: false,
  configurable: true
});
export {
  Headers as default
};
//# sourceMappingURL=headers.js.map
