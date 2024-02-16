// @ts-ignore: Missing declaration
import textile from 'textile-js'
import { formatCurrency, formatNumber } from '../../../common/utils/number-format.js'
import { GroupPath } from './GroupPath.js'
import { isNumber } from 'lodash-es'
import { toUrlSlug } from '../../../common/utils/slugify.js'
import { UNIT } from '../utils/constants.js'
import expandPrice from '../../../common/utils/expand-price.js'
import round from '../../../common/utils/round.js'

import type { PDF } from './PDF.js'
import type { Image } from '../../../common/entities/Image.js'

type Quantity = { value: number; unit: string } | undefined
type Weight = { value: number; unit: string } | undefined

export class Product {
  constructor(readonly module: number) {}

  // --- [ Member ] --------------------------------------------------------------------------------

  public id: number = 0
  public group?: number
  public ean?: string
  public price?: number
  public vat?: number
  public frontpage?: boolean
  public image?: Image
  public pdf?: PDF
  public path = new GroupPath()
  public name?: string
  public description?: string
  public teaser?: string
  public legal?: string

  protected _code?: string
  protected _quantity?: Quantity
  protected _weight?: Weight

  // --- [ Setter ] --------------------------------------------------------------------------------

  public set code(code: string | number | undefined) {
    this._code = code?.toString()
  }

  public set quantity(quantity: { value: number; unit?: string }) {
    this._quantity = {
      unit: getUnit('ea'),
      value: quantity.value
    }
  }

  public set weight(weight: { value: number; unit?: string }) {
    this._weight = {
      unit: getUnit('kg'),
      value: weight.value
    }
  }

  // --- [ Getter ] -----------------------------------------------------------------------

  public get code(): string | undefined {
    return this._code
  }

  public get slug() {
    return this.name ? toUrlSlug(this.name) : undefined
  }

  public get quantity(): Quantity {
    return this._quantity
  }

  public get weight(): Weight {
    return this._weight
  }

  public get pricePerUnit() {
    if (!this.price || !this.quantity) return undefined

    let pricePerUnit = 0

    pricePerUnit = this.quantity.value !== 1 ? this.price / this.quantity.value : this.price
    pricePerUnit = round(pricePerUnit)

    return pricePerUnit
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      id: this.id,
      name: this.name,
      group: this.group,
      slug: this.slug,
      code: this.code,
      ean: this.ean,
      description: this.description ? textile.parse(this.description) : undefined,
      teaser: this.teaser ? textile.parse(this.teaser) : undefined,
      legal: this.legal ? textile.parse(this.legal) : undefined,
      path: this.path?.display(),
      quantity: this.quantity
        ? {
            value: this.quantity.value,
            formatted: formatNumber.format(this.quantity.value) + ' ' + this.quantity.unit
          }
        : undefined,
      weight: this.weight
        ? {
            value: this.weight.value,
            formatted: formatNumber.format(this.weight.value) + ' ' + this.weight.unit
          }
        : undefined,
      price: isNumber(this.price) ? expandPrice(this.price) : undefined,
      pricePerUnit:
        this.pricePerUnit && this.quantity
          ? {
              value: this.pricePerUnit,
              formatted: formatCurrency.format(this.pricePerUnit) + ' pro ' + this.quantity.unit
            }
          : undefined,
      vat: this.vat
        ? {
            value: this.vat,
            formatted: this.vat + '%'
          }
        : undefined,
      image: this.image?.display(),
      pdf: this.pdf?.display(),
      frontpage: this.frontpage
    })
  }
}

// Helper

function getUnit(unit: string) {
  //@ts-ignore
  return Object.keys(UNIT).includes(unit) ? UNIT[unit] : unit
}
