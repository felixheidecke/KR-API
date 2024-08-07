import expandPrice from '#utils/expand-price.js'
import { handleText } from '#utils/handle-text.js'

export class SupplementalCost {
  constructor(readonly module: number) {}

  // --- [ Member ] --------------------------------------------------------------------------------

  public price = 0
  public title = ''
  public description = ''

  public display() {
    return new SupplementalCostDisplay(this)
  }
}

class SupplementalCostDisplay {
  constructor(supplementalCost: SupplementalCost) {
    const { value, formatted } = expandPrice(supplementalCost.price)
    this.value = value
    this.formatted = formatted
    this.title = supplementalCost.title
    this.description = supplementalCost.description
      ? handleText(supplementalCost.description)
      : null
  }

  readonly value: number
  readonly formatted: string
  readonly title: string
  readonly description: string | null
}
