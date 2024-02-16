// @ts-ignore
import textile from 'textile-js'

import type { Image } from '../../../common/entities/Image.js'

export class ArticleContent {
  public id: number = 0
  public text = ''
  public image?: Image

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      $id: this.id,
      text: this.text ? (textile.parse(this.text) as string) : '',
      image: this.image ? this.image.display() : undefined
    })
  }
}
