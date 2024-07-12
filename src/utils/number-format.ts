import { LOCALE } from './constants.js'

export const formatCurrency = Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR'
})

export const formatNumber = Intl.NumberFormat(LOCALE)
