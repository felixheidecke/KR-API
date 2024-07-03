import { HEADER } from '../../constants.js'

export async function setNoStoreHeaders(_, response) {
  response.headers({
    [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
  })
}
