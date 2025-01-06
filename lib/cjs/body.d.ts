import { BodyInit, RequestInit } from "./types.js";
import Blob from "./blob.js";
export default class Body {
    body: BodyInit;
    protected disturbed: boolean;
    size: number;
    timeout: number;
    headers: Headers | undefined;
    private _url;
    protected get url(): string;
    protected set url(value: string);
    constructor(body: BodyInit | null | undefined, init?: RequestInit | ResponseInit);
    get bodyUsed(): boolean;
    /**
     * Decode response as ArrayBuffer
     *
     * @return {Promise}
     */
    arrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Return raw response as Blob
     *
     * @return {Promise}
     */
    blob(): Promise<Blob>;
    /**
     * Decode response as json
     *
     * @return {Promise}
     */
    json<T = any>(): Promise<T>;
    /**
     * Decode response as text
     *
     * @return {Promise}
     */
    text(): Promise<string>;
    /**
     * Decode response as buffer (non-spec api)
     *
     * @return {Promise}
     */
    buffer(): Promise<Buffer>;
    /**
     * Decode response as text, while automatically detecting the encoding and
     * trying to decode to UTF-8 (non-spec api)
     *
     * @return {Promise}
     */
    textConverted(): Promise<string>;
    /**
     * Decode buffers into utf-8 string
     *
     * @return {Promise}
     */
    private consumeBody;
}
