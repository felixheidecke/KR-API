import { HEADER, MIME_TYPE } from '../../constants.js'
import pkg from '../../../package.json' assert { type: 'json' }

export async function defaultHeadersHook(_, response) {
  response.headers({
    [HEADER.MESSAGE]: 'Klickrhein.de | Ihre Webagentur im Rheingau',
    [HEADER.VERSION]: pkg.version,
    [HEADER.CONTENT_TYPE]: MIME_TYPE.JSON
  })
}

export async function cacheHeadersNoStoreHook(_, response) {
  response.headers({
    [HEADER.CACHE_CONTROL]: [HEADER.PRIVATE, HEADER.NO_STORE].join(', ')
  })
}
