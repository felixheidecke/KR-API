import { toUrlSlug } from '../../../common/utils/slugify.js'

export class GroupPath {
  public path: { id: number; name: string }[] = []

  // --- [ Methods ] -------------------------------------------------------------------------------

  public prepend(id: number, name: string) {
    this.path.unshift({ id, name })
  }

  public append(id: number, name: string) {
    this.path.push({ id, name })
  }

  public display() {
    return this.path.map(({ id, name }) => ({
      id: id,
      name: name.trim(),
      slug: toUrlSlug(name, 25)
    }))
  }
}
