import { Stream } from "node:stream";
import { Agent } from "node:https";
import { AuthInfo, Session } from "electron";
import Blob from "./blob.js";
export type BodyInit = Stream | string | Blob | Buffer | null;
export declare enum FetchErrorType {
    BodyTimeout = "body-timeout",
    System = "system",
    MaxSize = "max-size",
    Abort = "abort",
    RequestTimeout = "request-timeout",
    Proxy = "proxy",
    NoRedirect = "no-redirect",
    MaxRedirect = "max-redirect",
    InvalidRedirect = "invalid-redirect"
}
export declare const netErrorMap: {
    ERR_CONNECTION_REFUSED: string;
    ERR_EMPTY_RESPONSE: string;
    ERR_NAME_NOT_RESOLVED: string;
    ERR_CONTENT_DECODING_FAILED: string;
    ERR_CONTENT_DECODING_INIT_FAILED: string;
    ERR_UNKNOW: string;
};
export type NetErrorType = keyof typeof netErrorMap;
export interface RequestInit {
    counter?: number;
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit;
    signal?: AbortSignal;
    redirect?: RequestRedirect;
    follow?: number;
    timeout?: number;
    size?: number;
    session?: Session;
    agent?: Agent;
    useElectronNet?: boolean;
    useSessionCookies?: boolean;
    user?: string;
    password?: string;
    /**
     * When running on Electron behind an authenticated HTTP proxy, handler of `electron.ClientRequest`'s `login` event.
     * Can be used for acquiring proxy credentials in an async manner (e.g. prompting the user).
     */
    onLogin?: (authInfo: AuthInfo) => Promise<{
        username: string;
        password: string;
    } | undefined>;
}
export interface ResponseInit {
    ok?: boolean;
    url?: string;
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
    useElectronNet?: boolean;
}
