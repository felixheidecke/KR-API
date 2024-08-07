// @ts-ignore
import expandPrice from '#utils/expand-price.js'

import type { Image } from '#common/entities/image.js'
import { handleText } from '#utils/handle-text.js'

export class MenuCard {
  constructor(readonly module: number) {}

  public name: string = ''
  public description?: string = ''
  public items: {
    title: string
    description?: string
    price: number
    image?: Image
  }[] = []

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      name: this.name.trim(),
      description: this.description ? handleText(this.description) : null,
      items: this.items.map(item => ({
        title: item.title.trim(),
        description: item.description ? handleText(item.description) : null,
        price: expandPrice(item.price),
        image: item.image ? item.image.display() : undefined
      }))
    })
  }
}
