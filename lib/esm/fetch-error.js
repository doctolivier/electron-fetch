import { netErrorMap } from "./types.js";
class FetchError extends Error {
  message;
  type;
  code;
  errno;
  constructor(message, type, systemError) {
    super(message);
    const regex = /^.*net::(.*)/;
    if (regex.test(message)) {
      let errorCode = regex.exec(message)?.[1] || netErrorMap.ERR_UNKNOW;
      if (Object.prototype.hasOwnProperty.call(netErrorMap, errorCode))
        errorCode = netErrorMap[errorCode];
      systemError = { code: errorCode };
    }
    this.message = message;
    this.type = type;
    if (systemError) {
      this.code = this.errno = systemError.code;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
export {
  FetchError as default
};
//# sourceMappingURL=fetch-error.js.map
