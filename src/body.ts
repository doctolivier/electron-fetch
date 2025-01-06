import Stream from "node:stream";

import { BodyInit, FetchErrorType, RequestInit } from "./types.js";
import { convert } from "./common.js";
import Blob from "./blob.js";
import FetchError from "./fetch-error.js";

export default class Body {
  public body: BodyInit;
  protected disturbed: boolean;
  public size: number;
  public timeout: number;
  public headers: Headers | undefined;
  private _url: string;
  protected get url(): string {
    return this._url;
  }
  protected set url(value: string) {
    this._url = value;
  }

  constructor(
    body: BodyInit | null | undefined,
    init: RequestInit | ResponseInit = {}
  ) {
    if (body == null || body === undefined) {
      // body is undefined or null
      body = null;
    } else if (typeof body === "string") {
      // body is string
    } else if (body instanceof Blob) {
      // body is blob
    } else if (Buffer.isBuffer(body)) {
      // body is buffer
    } else if (body instanceof Stream) {
      // body is stream
    } else {
      // none of the above
      // coerce to string
      body = String(body);
    }
    this.body = body;
    this.disturbed = false;
    this.size = (init as RequestInit).size || 0;
    this.timeout = (init as RequestInit).timeout || 0;
  }

  public get bodyUsed() {
    return this.disturbed;
  }

  /**
   * Decode response as ArrayBuffer
   *
   * @return {Promise}
   */
  public arrayBuffer(): Promise<ArrayBuffer> {
    return this.consumeBody().then(
      (buf: Buffer) =>
        buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength
        ) as ArrayBuffer
    );
  }

  /**
   * Return raw response as Blob
   *
   * @return {Promise}
   */
  public blob(): Promise<Blob> {
    const ct = (this.headers && this.headers.get("content-type")) || "";
    return this.consumeBody().then((buf: Buffer) =>
      Object.assign(
        // Prevent copying
        new Blob([], {
          type: ct.toLowerCase(),
        }),
        {
          buffer: buf,
        }
      )
    );
  }

  /**
   * Decode response as json
   *
   * @return {Promise}
   */
  public json<T = any>(): Promise<T> {
    return this.consumeBody().then((buffer: Buffer) =>
      JSON.parse(buffer.toString())
    );
  }

  /**
   * Decode response as text
   *
   * @return {Promise}
   */
  public text(): Promise<string> {
    return this.consumeBody().then((buffer: Buffer) => buffer.toString());
  }

  /**
   * Decode response as buffer (non-spec api)
   *
   * @return {Promise}
   */
  public buffer(): Promise<Buffer> {
    return this.consumeBody();
  }

  /**
   * Decode response as text, while automatically detecting the encoding and
   * trying to decode to UTF-8 (non-spec api)
   *
   * @return {Promise}
   */
  public textConverted() {
    return this.consumeBody().then((buffer: Buffer) =>
      convertBody(buffer, this.headers || ({} as Headers))
    );
  }

  /**
   * Decode buffers into utf-8 string
   *
   * @return {Promise}
   */
  private consumeBody(): Promise<Buffer> {
    if (this.disturbed) {
      return Promise.reject(new Error(`body used already for: ${this.url}`));
    }

    this.disturbed = true;

    // body is null
    if (this.body === null) {
      return Promise.resolve(Buffer.alloc(0));
    }

    // body is string
    if (typeof this.body === "string") {
      return Promise.resolve(Buffer.from(this.body));
    }

    // body is blob
    if (this.body instanceof Blob) {
      return Promise.resolve(this.body.buffer);
    }

    // body is buffer
    if (Buffer.isBuffer(this.body)) {
      return Promise.resolve(this.body);
    }

    if (!(this.body instanceof Stream)) {
      return Promise.resolve(Buffer.alloc(0));
    }

    // body is stream
    // get ready to actually consume the body
    const accum: Uint8Array[] = [];
    let accumBytes = 0;
    let abort = false;

    return new Promise((resolve, reject) => {
      let resTimeout: NodeJS.Timeout;

      // allow timeout on slow response body
      if (this.timeout) {
        resTimeout = setTimeout(() => {
          abort = true;
          reject(
            new FetchError(
              `Response timeout while trying to fetch ${this.url} (over ${this.timeout}ms)`,
              FetchErrorType.BodyTimeout
            )
          );
          (this.body as Stream).emit("cancel-request");
        }, this.timeout);
      }

      // handle stream error, such as incorrect content-encoding
      (this.body as Stream).on("error", (err) => {
        reject(
          new FetchError(
            `Invalid response body while trying to fetch ${this.url}: ${err.message}`,
            FetchErrorType.System,
            err
          )
        );
      });

      (this.body as Stream).on("data", (chunk) => {
        if (abort || chunk === null) {
          return;
        }

        if (this.size && accumBytes + chunk.length > this.size) {
          abort = true;
          reject(
            new FetchError(
              `content size at ${this.url} over limit: ${this.size}`,
              FetchErrorType.MaxSize
            )
          );
          (this.body as Stream).emit("cancel-request");
          return;
        }

        accumBytes += chunk.length;
        accum.push(chunk);
      });

      (this.body as Stream).on("end", () => {
        if (abort) {
          return;
        }

        clearTimeout(resTimeout);
        resolve(Buffer.concat(accum));
      });
    });
  }
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param {Buffer} buffer   Incoming buffer
 * @param {Headers} headers
 * @return {string}
 */
function convertBody(buffer: Buffer, headers: Headers) {
  const ct = headers.get("content-type");
  let charset = "utf-8";
  let res: string[] | null = null;

  // header
  if (ct) {
    res = /charset=([^;]*)/i.exec(ct);
  }

  // no charset in content type, peek at response body for at most 1024 bytes
  const str = buffer.subarray(0, 1024).toString();

  // html5
  if (!res && str) {
    res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
  }

  // html4
  if (!res && str) {
    res =
      /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(
        str
      );

    if (res) {
      const charsetMatch = res.pop();
      res = charsetMatch ? /charset=(.*)/i.exec(charsetMatch) : [];
    }
  }

  // xml
  if (!res && str) {
    res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
  }

  // found charset
  if (res) {
    charset = res.pop() || "";

    // prevent decode issues when sites use incorrect encoding
    // ref: https://hsivonen.fi/encoding-menu/
    if (charset === "gb2312" || charset === "gbk") {
      charset = "gb18030";
    }
  }

  // turn raw buffers into a single utf-8 buffer
  return convert(buffer, "UTF-8", charset).toString();
}
