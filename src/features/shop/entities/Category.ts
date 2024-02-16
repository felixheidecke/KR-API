// @ts-ignore: Missing declaration
import textile from 'textile-js'
import { toUrlSlug } from '../../../common/utils/slugify.js'
import { GroupPath } from './GroupPath.js'
import type { Product } from './Product.js'

export class Category {
  constructor(readonly module: number) {}

  // --- [ Member ] --------------------------------------------------------------------------------

  public id: number = 0
  public path?: GroupPath
  public group?: number
  public name?: string
  public description?: string
  public subcategories?: Category[]
  public products?: Product[]

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get slug() {
    return this.name ? toUrlSlug(this.name) : undefined
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display(): Record<string, unknown> {
    return Object.freeze({
      $id: this.id,
      // $module: this.module,
      $group: this.group,
      path: this.path?.display(),
      name: this.name?.trim(),
      slug: this.slug,
      description: this.description ? (textile.parse(this.description) as string) : undefined,
      subcategories: this.subcategories?.map(subcategory => subcategory.display()),
      products: this.products?.map(product => product.display())
    })
  }
}
