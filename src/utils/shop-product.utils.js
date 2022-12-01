import {
  ASSET_BASE_URL,
  NUMBER_FORMAT,
  NUMBER_FORMAT_CURRENCY,
  SHOP_UNIT
} from '#constants'
import { toUrlSlug } from '#libs/slugify'
import textile from 'textile-js'

/**
 * Remodel the structure of a Product
 *
 * @param {object} p raw Product
 * @returns {object} Restructured product
 */

export const productAdapter = (p) => {
  const quantity = p.quantity || p.defaultQuantity
  const unit = p.unit || p.defaultUnit
  const weight = p.weight || p.defaultWeight

  return {
    id: +p._id,
    module: p.module,
    code: p.productCode,
    slug: toUrlSlug(p.name),
    EAN: p.ean,
    name: p.name,
    teaser: p.teaser ? textile.parse(p.teaser) : null,
    description: p.description ? textile.parse(p.description) : null,
    legalInfo: p.legal ? textile.parse(p.legal) : null,
    category: p.categoryId
      ? {
          id: p.categoryId,
          name: p.categoryName,
          slug: toUrlSlug(p.categoryName)
        }
      : null,

    quantity: {
      value: quantity,
      unit,
      formatted: NUMBER_FORMAT.format(quantity) + ' ' + SHOP_UNIT[unit]
    },

    weight: {
      value: weight,
      unit: p.altWeight ? 'custom' : 'kg',
      formatted:
        NUMBER_FORMAT.format(weight) + ' ' + (p.altWeight || SHOP_UNIT.kg)
    },

    price: {
      value: p.price,
      formatted: NUMBER_FORMAT_CURRENCY.format(p.price)
    },

    tax: {
      value: p.tax,
      formatted: NUMBER_FORMAT.format(p.tax) + '%'
    },

    image: p.image
      ? {
          src: ASSET_BASE_URL + p.image,
          largeSrc: p.imageBig ? ASSET_BASE_URL + p.imageBig : null,
          alt: p.name
        }
      : null,

    pdf: p.pdf
      ? {
          src: ASSET_BASE_URL + p.pdf || null,
          name: p.pdfName || null,
          title: p.pdfTitle ? p.pdfTitle.trim() : 'Produktinformationen'
        }
      : null,

    showOnFrontpage: !!p.frontpage
  }
}
