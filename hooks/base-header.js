import { HEADER } from '#utils/constants'

export default async (_, response) => {
  response.headers({
    [HEADER.MESSAGE]: 'Klickrhein.de | Ihre Webagentur im Rheingau',
  })
}