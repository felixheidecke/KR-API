import { HttpError } from '../../../decorators/Error.js'
import { z } from 'zod'

import type { FastifyRequest } from 'fastify'
import type { ZodError } from 'zod'
import { head } from 'lodash-es'

export default async (request: FastifyRequest) => {
  try {
    z.object({
      'api-key': z
        .string({ message: 'Missing required API-Key' })
        .length(32, { message: 'Invalid API-Key' })
    }).parse(request.headers)
  } catch (error) {
    const { fieldErrors } = (error as ZodError).flatten()

    throw HttpError.UNAUTHORIZED(head(fieldErrors['api-key']))
  }
}
