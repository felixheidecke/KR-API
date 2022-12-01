import { groupBy, reduce } from 'lodash-es'
import textile from 'textile-js'

// --- Adapter -----------------------------------------------------------------

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
