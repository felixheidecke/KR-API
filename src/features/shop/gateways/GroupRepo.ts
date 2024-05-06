import knex from '../../../modules/knex.js'
import { ProductRepo } from './ProductRepo.js'

export namespace GroupRepo {
  export type Group = {
    _id: number
    module: number
    name: string
    description: string | undefined
    group: number
    path: GroupPath[] | []
    subgroups: Group[] | undefined
    products: ProductRepo.Product[] | undefined
  }

  export type GroupPath = {
    _id: number
    name: string
    group?: number | null
  }
}

export class GroupRepo {
  public static async groupExists(module: number, id: number): Promise<boolean> {
    return !!(await knex('Shop3Group').select('_id').where({ active: 1, module, _id: id }).first())
  }

  public static async readGroup(module: number, id: number): Promise<GroupRepo.Group | null> {
    return await knex('Shop3Group')
      .select('_id', 'module', 'name', 'description', 'group')
      .where({ active: 1, module, _id: id })
      .first()
      .then(async function (group: GroupRepo.Group) {
        if (!group) return null

        group.path = group.group ? await GroupRepo.readGroupPath(group.group) : []
        group.subgroups = (await GroupRepo.readGroups(module, group._id)) || []

        return group
      })
  }

  public static async readGroupByProductId(
    module: number,
    id: number
  ): Promise<GroupRepo.Group | null> {
    return await knex('Shop3Product')
      .select('group')
      .where({ active: 1, module, _id: id })
      .first()
      .then(async function ({ group }: { group: number }) {
        return await knex('Shop3Group')
          .select('_id', 'module', 'name', 'description', 'group')
          .where({ active: 1, module, _id: group })
          .first()
          .then(async function (group: GroupRepo.Group) {
            if (!group) return null

            group.path = group.group ? await GroupRepo.readGroupPath(group.group) : []
            group.subgroups = (await GroupRepo.readGroups(module, group._id)) || []

            return group
          })
      })
  }

  public static async readGroupIdsRecursive(module: number, id: number): Promise<number[]> {
    return await knex
      .withRecursive('groups', qb => {
        qb.select('_id', 'group')
          .from('Shop3Group')
          .where({ active: 1, module, _id: id })
          .union(qb => {
            qb.select('group._id', 'group.group')
              .from('Shop3Group as group')
              .join('groups', 'groups._id', 'group.group')
          })
      })
      .select('_id')
      .from('groups')
      .then(rows => rows.map(row => row._id))
  }

  public static async readGroups(
    module: number,
    group: number | null = null
  ): Promise<GroupRepo.Group[]> {
    return await knex('Shop3Group')
      .select('_id', 'module', 'name', 'description', 'group')
      .where({ active: 1, module, group })
      .groupBy('_id')
      .orderBy('priority', 'group')
      .then(async function (groups) {
        return await Promise.all(
          groups.map(async group => {
            group.path = group.group ? await GroupRepo.readGroupPath(group.group) : []
            group.subgroups = (await GroupRepo.readGroups(module, group._id)) || []

            return group
          })
        )
      })
  }

  public static async readGroupPath(
    group: number,
    path: GroupRepo.GroupPath[] = []
  ): Promise<GroupRepo.GroupPath[]> {
    await knex('Shop3Group')
      .select('_id', 'name', 'group')
      .where({ _id: group })
      .first()
      .then(async (group: GroupRepo.GroupPath) => {
        path.unshift(group)

        if (group.group) {
          return await GroupRepo.readGroupPath(group.group, path)
        }
      })

    return path
  }
}
