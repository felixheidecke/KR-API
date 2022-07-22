export const HEADER = {
  CACHE_CONTROL: 'Cache-Control',
  CACHE_FAIL: 'FAIL',
  CACHE_HIT: 'HIT',
  CACHE_MISS: 'MISS',
  CACHE: 'X-Cache',
  CONTENT_TYPE: 'Content-Type',
  MESSAGE: 'X-Message',
  MAX_AGE: (ttl) => 'max-age=' + ttl,
  PUBLIC: 'public',
  PRIVATE: 'private',
  NO_STORE: 'no-store',
  VERSION: 'x-version'
}

export const MIME_TYPE_JSON = 'application/json'

export const ASSET_BASE_URL = 'https://www.rheingau.de/data/'
