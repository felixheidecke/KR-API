import knex from '../../../modules/knex.js'
import { ProductRepo } from './ProductRepo.js'

export type RepoGroup = {
  _id: number
  module: number
  name: string
  description: string | undefined
  group: number
  path: RepoGroupPath[] | []
  subgroups: RepoGroup[] | undefined
  products: ProductRepo.Product[] | undefined
}

export type RepoGroupPath = {
  _id: number
  name: string
  group?: number | null
}

export async function groupExists(module: number, id: number): Promise<boolean> {
  return !!(await knex('Shop3Group').select('_id').where({ active: 1, module, _id: id }).first())
}

export async function readGroup(module: number, id: number): Promise<RepoGroup | null> {
  return await knex('Shop3Group')
    .select('_id', 'module', 'name', 'description', 'group')
    .where({ active: 1, module, _id: id })
    .first()
    .then(async function (group: RepoGroup) {
      if (!group) return null

      group.path = group.group ? await readGroupPath(group.group) : []
      group.subgroups = (await readGroups(module, group._id)) || []

      return group
    })
}

export async function readGroupIdsRecursive(module: number, id: number): Promise<number[]> {
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

export async function readGroups(module: number, group: number | null = null) {
  return await knex('Shop3Group')
    .select('_id', 'module', 'name', 'description', 'group')
    .where({ active: 1, module, group })
    .groupBy('_id')
    .orderBy('priority', 'group')
    .then(async function (groups) {
      return await Promise.all(
        groups.map(async group => {
          group.path = group.group ? await readGroupPath(group.group) : []
          group.subgroups = (await readGroups(module, group._id)) || []

          return group
        })
      )
    })
}

export async function readGroupPath(
  group: number,
  path: RepoGroupPath[] = []
): Promise<RepoGroupPath[]> {
  await knex('Shop3Group')
    .select('_id', 'name', 'group')
    .where({ _id: group })
    .first()
    .then(async (group: RepoGroupPath) => {
      path.unshift(group)

      if (group.group) {
        return await readGroupPath(group.group, path)
      }
    })

  return path
}
