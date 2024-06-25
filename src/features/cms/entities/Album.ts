import { toUrlSlug } from '../../../common/utils/slugify.js'
import type { Image } from '../../../common/entities/Image.js'

export class Album {
  constructor(readonly module: number) {}

  protected _slug: string = ''
  protected _title: string = ''
  public id: number = 0
  public images?: Image[]

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get title() {
    return this._title
  }

  public get slug() {
    return this._slug
  }

  public get size() {
    return this.images ? this.images.length : 0
  }

  // --- [ Setter ] --------------------------------------------------------------------------------

  public set title(value: string) {
    this._title = value.trim()
    this._slug = toUrlSlug(value, 75)
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      id: +this.id,
      module: +this.module,
      title: this.title.trim(),
      slug: toUrlSlug(this.title, 75),
      images: this.images?.map(image => image.display()) || null
    })
  }
}
