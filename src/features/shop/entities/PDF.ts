import { ASSET_BASE_URL } from '../../../constants.js'

export class PDF {
  constructor(src?: string) {
    this.src = src || ''
  }

  public path = ASSET_BASE_URL
  public src = ''
  public title = ''

  // --- [ Getter ] --------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      src: this.path + this.src,
      title: this.title
    })
  }
}
