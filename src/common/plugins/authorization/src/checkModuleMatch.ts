import { HttpError } from '../../../decorators/Error.js'
import type { InferFastifyRequest } from '../../../types/InferFastifyRequest.js'

export default async ({
  params,
  user
}: InferFastifyRequest<{ params: { module: string | number } }>) => {
  if (!params.module) {
    throw new Error('Module ID is required')
  }

  if (!(user.moduleIds.includes(+params.module) || user.isSuperuser)) {
    throw HttpError.FORBIDDEN()
  }
}
