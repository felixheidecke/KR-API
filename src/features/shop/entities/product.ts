import { formatCurrency, formatNumber } from '#utils/number-format.js'
import { GroupPath } from './group-path.js'
import { handleText } from '#utils/handle-text.js'
import { isNumber, round } from 'lodash-es'
import { toUrlSlug } from '#utils/slugify.js'
import { UNIT } from '../utils/constants.js'
import expandPrice from '#utils/expand-price.js'

import type { Image } from '#common/entities/image.js'
import type { PDF } from '#common/entities/pdf.js'

type Quantity = { value: number; unit: string } | undefined
type Weight = { value: number; unit: string } | undefined

export class Product {
  constructor(readonly module: number) {}

  // --- [ Member ] --------------------------------------------------------------------------------

  public id: number = 0
  public group?: number | null
  public ean?: string | null
  public price?: number | null
  public vat?: number | null
  public frontpage?: boolean | null
  public image?: Image | null
  public pdf?: PDF | null
  public path = new GroupPath()
  public name?: string | null
  public description?: string | null
  public teaser?: string | null
  public legal?: string | null

  protected _code?: string
  protected _quantity?: Quantity
  protected _weight?: Weight

  // --- [ Setter ] --------------------------------------------------------------------------------

  public set code(code: string | number | undefined) {
    this._code = code?.toString()
  }

  public set quantity(quantity: { value: number; unit: string }) {
    this._quantity = {
      unit: getUnit(quantity.unit),
      value: quantity.value
    }
  }

  public set weight(weight: { value: number; unit: string }) {
    this._weight = {
      unit: getUnit(weight.unit),
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
    pricePerUnit = round(pricePerUnit, 2)

    return pricePerUnit
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display() {
    return Object.freeze({
      id: this.id,
      name: this.name,
      group: this.group || null,
      slug: this.slug,
      code: this.code || null,
      ean: this.ean || null,
      description: this.description ? handleText(this.description) : null,
      teaser: this.teaser ? handleText(this.teaser) : null,
      legal: this.legal ? handleText(this.legal) : null,
      path: this.path?.display(),
      quantity: this.quantity
        ? {
            value: this.quantity.value,
            formatted: formatNumber.format(this.quantity.value) + ' ' + this.quantity.unit
          }
        : null,
      weight: this.weight
        ? {
            value: this.weight.value,
            formatted: formatNumber.format(this.weight.value) + ' ' + this.weight.unit
          }
        : null,
      price: isNumber(this.price) ? expandPrice(this.price) : null,
      pricePerUnit:
        this.pricePerUnit && this.quantity
          ? {
              value: this.pricePerUnit,
              formatted: formatCurrency.format(this.pricePerUnit) + ' pro ' + this.quantity.unit
            }
          : null,
      vat: this.vat
        ? {
            value: this.vat,
            formatted: this.vat + '%'
          }
        : null,
      image: this.image?.display() || null,
      pdf: this.pdf?.display() || null,
      frontpage: this.frontpage
    })
  }
}

// Helper

function getUnit(unit: string) {
  //@ts-ignore
  return Object.keys(UNIT).includes(unit) ? UNIT[unit] : unit
}
