import { HEADER } from '#utils/constants'
import pkg from '../package.json' assert { type: 'json' }

export default async (_, response) => {
  response.headers({
    [HEADER.MESSAGE]: 'Klickrhein.de | Ihre Webagentur im Rheingau',
    [HEADER.VERSION]: pkg.version
  })
}
