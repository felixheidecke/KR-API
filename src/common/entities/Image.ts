type SrcSet = {
  small?: string
  medium?: string
  large?: string
}

type Align = 'left' | 'right'

export class Image {
  constructor(src?: string, description?: string, align?: Align) {
    this.src = src || ''
    this.description = description
    this.align = align
  }

  public srcset: SrcSet = {}
  public src = ''
  public align?: Align | null
  private _description?: string | null

  set description(value: string | null | undefined) {
    this._description = value?.trim() || null
  }

  get description() {
    return this._description
  }

  public addSrc(src: string, type?: keyof SrcSet) {
    if (!type) {
      this.src = src
    } else {
      this.srcset[type] = src
    }

    return this
  }

  public display() {
    return Object.freeze({
      src: this.src,
      description: this.description || null,
      align: this.align || null,
      srcset: {
        small: this.srcset.small ? this.srcset.small : undefined,
        medium: this.srcset.medium ? this.srcset.medium : undefined,
        large: this.srcset.large ? this.srcset.large : undefined
      }
    })
  }
}
