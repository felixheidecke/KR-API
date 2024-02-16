import { DATA_BASE_PATH } from './constants.js'

export function prependDataBasePath(src: string): string {
  return DATA_BASE_PATH + '/' + src
}
