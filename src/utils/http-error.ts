import type { ZodError } from 'zod'

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

  public static BAD_REQUEST(message = 'Bad Request', details?: any) {
    return new HttpError(message, 400, 'BAD_REQUEST', details)
  }

  public static UNAUTHORIZED(message = 'Unauthorized', details?: any) {
    return new HttpError(message, 401, 'UNAUTHORIZED', details)
  }

  public static FORBIDDEN(message = 'Forbidden', details?: any) {
    return new HttpError(message, 403, 'FORBIDDEN', details)
  }

  public static NOT_FOUND(message = 'Not Found', details?: any) {
    return new HttpError(message, 404, 'NOT_FOUND', details)
  }

  public static CONFLICT(message = 'Conflict', details?: any) {
    return new HttpError(message, 409, 'CONFLICT', details)
  }

  public static fromZodError(error: ZodError) {
    console.log(error)

    const { formErrors, fieldErrors } = error.flatten()
    const details = formErrors.length ? formErrors : fieldErrors

    return new HttpError('Request Validation Error', 400, 'VALIDATION_ERROR', details)
  }

  public static fromError(error: Error) {
    return new HttpError(error.message, 500, 'INTERNAL_SERVER_ERROR')
  }
}
