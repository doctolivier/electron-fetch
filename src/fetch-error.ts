import { FetchErrorType, NetErrorType, netErrorMap } from "./types.js";

export default class FetchError extends Error {
  message: string;
  type: FetchErrorType;
  code?: string;
  errno?: string;

  constructor(
    message: string,
    type: FetchErrorType,
    systemError?: { code: string }
  ) {
    super(message);

    const regex = /^.*net::(.*)/;
    if (regex.test(message)) {
      let errorCode: NetErrorType =
        (regex.exec(message)?.[1] as NetErrorType) || netErrorMap.ERR_UNKNOW;

      if (Object.prototype.hasOwnProperty.call(netErrorMap, errorCode))
        errorCode = netErrorMap[errorCode] as NetErrorType;
      systemError = { code: errorCode };
    }
    this.message = message;
    this.type = type;

    // when err.type is `system`, err.code contains system error code
    if (systemError) {
      this.code = this.errno = systemError.code;
    }

    // hide custom error implementation details from end-users
    Error.captureStackTrace(this, this.constructor);
  }
}
