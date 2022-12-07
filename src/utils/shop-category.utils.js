import { toUrlSlug } from '#libs/slugify'
import textile from 'textile-js'

// ---  Adapter  ---------------------------------------------------------------

export const categoryAdapter = (c) => {
  return {
    id: c.id,
    name: c.name,
    slug: toUrlSlug(c.name),
    description: c.description ? textile.parse(c.description) : '',
    productCount: c.productCount
  }
}
