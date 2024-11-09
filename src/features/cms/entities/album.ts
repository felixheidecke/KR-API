import { toUrlSlug } from '#utils/slugify.js'
import type { Image } from '#common/entities/image.js'

export class Album {
  constructor(readonly module: number) {}

  protected _slug: string | null = null
  protected _title: string | null = null
  public id: number = 0
  public images: Image[] = []

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

  public set title(value: string | null | undefined) {
    if (value) {
      this._title = value.trim()
      this._slug = toUrlSlug(value, 75)
    } else {
      this._title = null
      this._slug = null
    }
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      id: +this.id,
      module: +this.module,
      title: this.title,
      slug: this.slug,
      images: this.images?.map(image => image.display())
    })
  }
}
