import { handleText } from '../utils/handleText.js'

import type { Image } from '../../../common/entities/Image.js'

export class ArticleContent {
  public id: number = 0
  public title?: string | null
  public text?: string | null
  public image?: Image | null

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      id: this.id,
      title: this.title?.trim() || null,
      text: this.text ? handleText(this.text) : null,
      image: this.image ? this.image.display() : null
    })
  }
}
