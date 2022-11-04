export const HEADER = {
  CACHE_CONTROL: 'Cache-Control',
  CACHE_FAIL: 'FAIL',
  CACHE_HIT: 'HIT',
  CACHE_MISS: 'MISS',
  CACHE: 'x-Cache',
  CONTENT_TYPE: 'Content-Type',
  MESSAGE: 'x-Message',
  MAX_AGE: (ttl) => 'max-age=' + ttl,
  PUBLIC: 'public',
  PRIVATE: 'private',
  NO_STORE: 'no-store',
  VERSION: 'x-version',
  USER_DATA: 'x-user-data',
  JWT: (token) => `JWT ${token}`
}

export const MIME_TYPE_JSON = 'application/json'

export const ASSET_BASE_URL = 'https://www.rheingau.de/data/'

export const LOCALE = 'de-DE'

export const NUMBER_FORMAT_CURRENCY = Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR'
})

export const NUMBER_FORMAT = Intl.NumberFormat(LOCALE)

export const SHOP_UNIT = {
  ea: 'St.',
  l: 'Ltr.',
  kg: 'kg.'
}
