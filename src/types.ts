import { Stream } from "node:stream";
import { Agent } from "node:https";
import { AuthInfo, Session } from "electron";

import Blob from "./blob.js";

// BODY TYPES
export type BodyInit = Stream | string | Blob | Buffer | null;

// FETCH TYPES
export enum FetchErrorType {
  BodyTimeout = "body-timeout",
  System = "system",
  MaxSize = "max-size",
  Abort = "abort",
  RequestTimeout = "request-timeout",
  Proxy = "proxy",
  NoRedirect = "no-redirect",
  MaxRedirect = "max-redirect",
  InvalidRedirect = "invalid-redirect",
}

export const netErrorMap = {
  ERR_CONNECTION_REFUSED: "ECONNREFUSED",
  ERR_EMPTY_RESPONSE: "ECONNRESET",
  ERR_NAME_NOT_RESOLVED: "ENOTFOUND",
  ERR_CONTENT_DECODING_FAILED: "Z_DATA_ERROR",
  ERR_CONTENT_DECODING_INIT_FAILED: "Z_DATA_ERROR",
  ERR_UNKNOW: "UNKNOWN",
};

export type NetErrorType = keyof typeof netErrorMap;

export interface RequestInit {
  // These properties are part of the Fetch Standard
  counter?: number;
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit;
  signal?: AbortSignal;
  // (/!\ only works when running on Node.js) set to `manual` to extract redirect headers, `error` to reject redirect
  redirect?: RequestRedirect;

  ////////////////////////////////////////////////////////////////////////////
  // The following properties are electron-fetch extensions
  // (/!\ only works when running on Node.js) maximum redirect count. 0 to not follow redirect
  follow?: number;
  // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
  timeout?: number;
  // maximum response body size in bytes. 0 to disable
  size?: number;
  session?: Session;
  agent?: Agent;
  useElectronNet?: boolean;
  useSessionCookies?: boolean;
  // When running on Electron behind an authenticated HTTP proxy, username to use to authenticate
  user?: string;
  // When running on Electron behind an authenticated HTTP proxy, password to use to authenticate
  password?: string;
  /**
   * When running on Electron behind an authenticated HTTP proxy, handler of `electron.ClientRequest`'s `login` event.
   * Can be used for acquiring proxy credentials in an async manner (e.g. prompting the user).
   */
  onLogin?: (
    authInfo: AuthInfo
  ) => Promise<{ username: string; password: string } | undefined>;
}

export interface ResponseInit {
  ok?: boolean;
  url?: string;
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
  useElectronNet?: boolean;
}
