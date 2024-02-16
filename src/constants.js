export const HEADER = {
  AUTHORIZATION: 'Authorization',
  CACHE_CONTROL: 'Cache-Control',
  ACCEPT_LANGUAGE: 'Accept-Language',
  CACHE_FAIL: 'FAIL',
  CACHE_HIT: 'HIT',
  CACHE_MISS: 'MISS',
  CACHE: 'X-Cache',
  CONTENT_TYPE: 'Content-Type',
  MESSAGE: 'Message',
  PUBLIC: 'public',
  PRIVATE: 'private',
  NO_STORE: 'no-store',
  VERSION: 'Version'
}

export const TOKEN = {
  BEARER: (token) => `Bearer ${token}`,
  BASIC: (token) => `Basic ${token}`
}

export const MIME_TYPE = {
  JSON: 'application/json',
  TEXT: 'text/plain'
}

export const ASSET_BASE_URL = 'https://www.rheingau.de/data/'

export const LOCALE = 'de-DE'

export const NUMBER_FORMAT_CURRENCY = Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR'
})

export const NUMBER_FORMAT = Intl.NumberFormat(LOCALE)
