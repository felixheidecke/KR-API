// @ts-ignore: Missing declaration
import textile from 'textile-js'
import { toUrlSlug } from '../../../common/utils/slugify.js'
import { GroupPath } from './GroupPath.js'

export class Group {
  constructor(readonly module: number) {}

  // --- [ Member ] --------------------------------------------------------------------------------

  public id: number = 0
  public path?: GroupPath
  public group?: number
  public name?: string
  public description?: string
  public subgroups?: Group[]

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get slug() {
    return this.name ? toUrlSlug(this.name) : undefined
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public display(): Record<string, unknown> {
    return Object.freeze({
      id: this.id,
      path: this.path?.display(),
      name: this.name?.trim(),
      slug: this.slug,
      description: this.description ? (textile.parse(this.description) as string) : undefined,
      subgroups: this.subgroups?.map(subgroup => subgroup.display())
    })
  }
}
