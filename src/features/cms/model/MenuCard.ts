// @ts-ignore
import textile from 'textile-js'
import expandPrice from '../../../common/utils/expand-price.js'

import type { Image } from '../../../common/entities/Image.js'

export class MenuCard {
  constructor(readonly module: number) {}

  public name: string = ''
  public description: string = ''
  public items: {
    title: string
    description: string
    price: number
    image?: Image
  }[] = []

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      name: this.name.trim(),
      description: this.description ? textile.parse(this.description) : '',
      items: this.items.map(item => ({
        title: item.title.trim(),
        description: item.description ? textile.parse(item.description) : '',
        price: expandPrice(item.price),
        image: item.image ? item.image.display() : undefined
      }))
    })
  }
}
