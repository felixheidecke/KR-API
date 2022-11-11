import textile from 'textile-js'
import { groupBy, reduce } from 'lodash-es'
import slugify from 'slugify'
import { unserialize } from 'php-serialize'
import {
  ASSET_BASE_URL,
  NUMBER_FORMAT,
  NUMBER_FORMAT_CURRENCY,
  SHOP_UNIT
} from '#utils/constants'

// --- [ Adapter ] -------------------------------------------------------------

export const menuAdapter = (rows) => {
  const groups = groupBy(rows, 'category')

  const data = reduce(
    groups,
    (menu, items) => {
      const name = items[0].category.trim()
      const description = items[0].category_description.trim().length
        ? textile.parse(items[0].category_description)
        : null

      return [
        ...menu,
        {
          name,
          description,
          items: items.map((item) => menuItemAdapter(item))
        }
      ]
    },
    []
  )

  return data
}

export const menuItemAdapter = (item) => {
  return {
    id: item.id,
    name: item.title,
    description: item.description.trim().length
      ? textile.parse(item.description)
      : null,
    price: item.price
  }
}

/**
 * Remodel the structure of rtd.ArticleParagraph
 *
 * @param {object} p Paragraph
 * @returns {object} Restructured paragraph
 */

export const paragraphAdapter = (p) => {
  return {
    id: p._id,
    text: textile.parse(p.text) || null,
    image: p.image
      ? {
          src: ASSET_BASE_URL + p.image,
          alt: p.imageDescription,
          align: p.imageAlign || null
        }
      : null
  }
}

/**
 * Remodel the structure of an rtd.Article
 *
 * @param {object} a Article
 * @returns {object} Restructured article
 */

export const articleAdapter = (a) => {
  const slugifyConfig = {
    lower: true,
    remove: /[*+~.,/()'"!?:@]/g
  }

  return {
    id: a._id,
    module: a.module,
    slug: slugify(a.title, slugifyConfig),
    title: a.title,
    date: a.date,
    text: textile.parse(a.text) || null,
    image: a.image
      ? {
          src: ASSET_BASE_URL + a.image,
          thumbSrc: a.imageSmall ? ASSET_BASE_URL + a.imageSmall : null,
          alt: a.imageDescription
        }
      : null,
    pdf: a.pdf
      ? {
          src: ASSET_BASE_URL + a.pdf || null,
          name: a.pdfName || null,
          title: a.pdfTitle ? a.pdfTitle.trim() : 'Weitere Infos'
        }
      : null,
    web: a.web || null,
    author: a.author || null
  }
}

/**
 * Remodel the structure of an rtd.Event
 *
 * @param {object} e Event
 * @returns {object} Restructured event
 */

export const eventAdapter = (e) => {
  const slugifyConfig = {
    lower: true,
    remove: /[*+~.,/()'"!?:@]/g
  }

  return {
    id: e._id,
    module: e.module,
    slug: slugify(e.title, slugifyConfig),
    title: e.title,
    starts: e.startDate,
    ends: e.endDate,
    description: e.description ? textile.parse(e.description) : null,
    details: e.details ? textile.parse(e.details) : null,
    image: e.image
      ? {
          src: ASSET_BASE_URL + e.image,
          thumbSrc: e.thumb ? ASSET_BASE_URL + e.thumb : null,
          alt: e.imageDescription
        }
      : null,
    pdf: e.pdf
      ? {
          src: ASSET_BASE_URL + e.pdf || null,
          name: e.pdfName || null,
          title: e.pdfTitle ? e.pdfTitle.trim() : 'Weitere Infos'
        }
      : null,
    website: e.detailsURL || null,
    ticketshop: e.url || null,
    organizer: e.presenter || null,
    coordinates:
      +e.lat > 0 && +e.lng > 0
        ? {
            lat: +e.lat,
            lng: +e.lng
          }
        : null
  }
}

/**
 * Remodel the structure of a Product
 *
 * @param {object} e raw Product
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
    EAN: p.ean,
    name: p.name,
    teaser: p.teaser ? textile.parse(p.teaser) : null,
    description: p.description ? textile.parse(p.description) : null,
    legalInfo: p.legal ? textile.parse(p.legal) : null,
    category: p.categoryId
      ? {
          id: p.categoryId,
          name: p.categoryName
        }
      : null,

    quantity: {
      value: quantity,
      unit,
      formatted: NUMBER_FORMAT.format(quantity) + ' ' + SHOP_UNIT[unit]
    },

    weight: {
      value: weight,
      formatted: NUMBER_FORMAT.format(weight) + ' ' + SHOP_UNIT.kg
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

export const categoryAdapter = (c) => {
  return {
    id: c._id,
    name: c.name,
    description: c.description ? textile.parse(c.description) : null
  }
}

export const orderAdapter = (order) => {
  return {
    ...order,
    order: unserialize('a:1:{s:4:"Test";s:17:"unserialize here!";}')
  }
}

export const credentialsAdapter = (credentials) => {
  const { paypal_client_id, paypal_secret, jwt_secret } = credentials

  return {
    paypal: paypal_client_id
      ? {
          clientId: paypal_client_id,
          secret: paypal_secret
        }
      : null,
    jwtSecret: jwt_secret
  }
}

export const fotoAdapter = (photo) => {
  const { id, description, filename, priority } = photo
  const normalizedDescription = description ? description.trim() : ''

  return {
    id,
    description: normalizedDescription,
    order: priority,
    image: {
      src: ASSET_BASE_URL + filename,
      alt: normalizedDescription
    }
  }
}
