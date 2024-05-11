type SrcSet = {
  small?: string
  medium?: string
  large?: string
}

type Align = 'left' | 'right'

export class Image {
  constructor(src?: string, description?: string, align?: Align) {
    this.src = src || ''
    this.description = description || ''
    this.align = align || undefined
  }

  public srcset: SrcSet = {}
  public src = ''
  public align?: Align
  public description = ''

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
      description: this.description,
      align: this.align,
      srcset: {
        small: this.srcset.small ? this.srcset.small : undefined,
        medium: this.srcset.medium ? this.srcset.medium : undefined,
        large: this.srcset.large ? this.srcset.large : undefined
      }
    })
  }
}
