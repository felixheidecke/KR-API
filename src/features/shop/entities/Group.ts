import { toUrlSlug } from '#utils/slugify.js'
import { handleText } from '#utils/handle-text.js'
import { GroupPath } from './group-path.js'

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
      description: this.description ? handleText(this.description) : undefined,
      subgroups: this.subgroups?.map(subgroup => subgroup.display())
    })
  }
}
