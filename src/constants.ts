export const HEADER = {
  AUTHORIZATION: 'Authorization',
  CACHE_CONTROL: 'Cache-Control',
  ACCEPT_LANGUAGE: 'Accept-Language',
  CACHE_FAIL: 'FAIL',
  CACHE_HIT: 'HIT',
  CACHE_MISS: 'MISS',
  CACHE: 'X-Cache',
  CONTENT_TYPE: 'Content-Type',
  MESSAGE: 'X-Message',
  PUBLIC: 'public',
  PRIVATE: 'private',
  NO_STORE: 'no-store',
  VERSION: 'X-Version'
} as const

export const MIME_TYPE = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  CSV: 'text/csv'
} as const

export const MEDIA_BASE_PATH = 'https://media.klickrhein.de'
export const LOCALE = 'de-DE'
export const TIME_ZONE = 'Europe/Berlin'
export const CURRENCY = 'EUR'