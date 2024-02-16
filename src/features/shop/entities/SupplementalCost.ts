// @ts-ignore
import textile from 'textile-js'
import expandPrice from '../../../common/utils/expand-price.js'

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
      ? textile.parse(supplementalCost.description)
      : ''
  }

  readonly value: number
  readonly formatted: string
  readonly title: string
  readonly description: string
}
