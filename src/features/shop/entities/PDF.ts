import { ASSET_BASE_URL } from '../../../constants.js'

export class PDF {
  constructor(src?: string, title?: string) {
    this.src = src || ''
    this.title = title || ''
  }

  public src = ''
  public title = ''

  // --- [ Getter ] --------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      src: this.src,
      title: this.title.trim()
    })
  }
}
