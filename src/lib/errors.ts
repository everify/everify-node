export const createError = ({
  name,
  message,
  ...rest
}: {
  name: string;
  message: string;
  [key: string]: string;
}) => {
  function EverifyError(this: any, name: string, message: string, rest = {}) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = name;
    this.message = message;
    Object.assign(this, rest);
  }
  EverifyError.prototype = Object.create(Error.prototype);
  EverifyError.prototype.constructor = EverifyError;
  EverifyError.prototype.name = name;
  // @ts-ignore
  return new EverifyError(name, message, rest);
};
