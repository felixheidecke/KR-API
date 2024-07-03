import type { FastifyRequest } from 'fastify'
import { HttpError } from '../../../decorators/Error.js'

export default async ({ user }: FastifyRequest) => {
  if (!user.isSuperuser) {
    throw HttpError.FORBIDDEN()
  }
}
