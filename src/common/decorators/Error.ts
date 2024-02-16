import type { ZodError } from 'zod'

export enum ErrorCodes {
  BAD_REQUEST,
  IS_EMPTY,
  IS_NULL,
  IS_UNDEFINED,
  NOT_FOUND,
  NOT_IMPLEMENTED,
  VALIDATION_ERROR,
  INTERNAL_SERVER_ERROR
}

export class ModuleError extends Error {
  name: string = 'ModuleError'

  constructor(
    public message: string,
    public code: ErrorCodes = ErrorCodes.INTERNAL_SERVER_ERROR,
    public details?: any
  ) {
    super(message)
  }
}

export class HttpError extends Error {
  name: string = 'HttpError'

  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
  }

  get response() {
    return {
      message: this.message,
      code: this.code,
      details: this.details
    }
  }

  public static fromZodError(error: ZodError) {
    const { formErrors, fieldErrors } = error.flatten()
    const details = formErrors.length ? formErrors : fieldErrors

    return new HttpError(
      'Request Validation Error',
      400,
      ErrorCodes[ErrorCodes.VALIDATION_ERROR],
      details
    )
  }

  public static fromError(error: Error) {
    return new HttpError(error.message, 500, ErrorCodes[ErrorCodes.INTERNAL_SERVER_ERROR])
  }

  public static fromModuleError(error: ModuleError) {
    return new HttpError(
      error.message,
      this.codeToStatusCode(error.code),
      ErrorCodes[error.code],
      error.details
    )
  }

  private static codeToStatusCode(code?: ErrorCodes) {
    switch (code) {
      case ErrorCodes.BAD_REQUEST:
      case ErrorCodes.VALIDATION_ERROR:
        return 400
      case ErrorCodes.IS_EMPTY:
      case ErrorCodes.IS_NULL:
      case ErrorCodes.IS_UNDEFINED:
      case ErrorCodes.NOT_FOUND:
        return 404
      case ErrorCodes.NOT_IMPLEMENTED:
        return 501
      default:
        return 500
    }
  }
}
