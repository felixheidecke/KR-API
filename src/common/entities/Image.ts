import { ASSET_BASE_URL } from '../../constants.js'

type SrcSet = {
  small?: string
  medium?: string
  large?: string
}

type Align = 'left' | 'right'

export class Image {
  constructor(src?: string, alt?: string, align?: Align) {
    this.src = src || ''
    this.alt = alt || ''
    this.align = align || undefined
  }

  public path = ASSET_BASE_URL
  public srcset: SrcSet = {}
  public src = ''
  public align?: Align
  public alt = ''

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
      src: this.path + this.src,
      alt: this.alt,
      align: this.align,
      srcset: {
        small: this.srcset.small ? this.path + this.srcset.small : undefined,
        medium: this.srcset.medium ? this.path + this.srcset.medium : undefined,
        large: this.srcset.large ? this.path + this.srcset.large : undefined
      }
    })
  }
}
