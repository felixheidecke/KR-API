import knex from '../../../services/knex.js'
import { Category } from '../entities/Category.js'
import { DetailLevel } from '../utils/detail-level.js'
import { GroupPath } from '../entities/GroupPath.js'
import { ModuleRepository } from './ModuleRepository.js'
import { ProductService } from '../services/ProductService.js'

type RepositoryCategory = {
  id: number
  module: number
  name: string
  description: string | undefined
  group: number
}

type RepositoryPath = {
  id: number
  name: string
  parentId?: number | null
}

export class CategoryRepository {
  public static async getCategory(
    module: number,
    id: number,
    complexity: DetailLevel = 0
  ): Promise<Category | null> {
    const repositoryCategory = (await knex('Shop3Group')
      .select('_id as id', 'module', 'name', 'description', 'group')
      .where({ active: 1, module, _id: id })
      .first()) as RepositoryCategory

    if (!repositoryCategory) return null

    const category = toNewCategory(repositoryCategory)

    if (category.group) {
      category.path = await this.getPath(category.group)
    }

    category.subcategories =
      (await this.getCategories(module, { group: category.id }, complexity, true)) || []

    if (complexity === DetailLevel.EXTENDED) {
      category.products = await ProductService.getProducts(
        module,
        {
          categoryId: category.id
        },
        DetailLevel.MINIMAL
      )
    }

    return category
  }

  public static async getCategories(
    module: number,
    query?: { group?: number },
    complexity: DetailLevel = 0,
    skipModuleCheck = false
  ) {
    if (!skipModuleCheck && !(await ModuleRepository.moduleExists(module, 'shop3'))) return null

    const moduleQuery = knex('Shop3Group')
      .select('_id as id', 'module', 'name', 'description', 'group')
      .where({ active: 1, module })

    if (query?.group) {
      moduleQuery.andWhere({ group: query.group })
    } else {
      moduleQuery.andWhere({ group: null })
    }

    const repositoryCategories = (await moduleQuery
      .groupBy('_id')
      .orderBy('group', 'priority')) as RepositoryCategory[]

    return await Promise.all(
      repositoryCategories.map(async repositoryCategory => {
        const category = toNewCategory(repositoryCategory)

        if (complexity >= DetailLevel.FULL) {
          if (category.group) {
            category.path = (await this.getPath(category.group)) || []
          }
        }

        if (complexity >= DetailLevel.BASIC) {
          category.subcategories =
            (await this.getCategories(module, { group: category.id }, complexity, true)) || []
        }

        if (complexity >= DetailLevel.EXTENDED) {
          category.products = await ProductService.getProducts(
            module,
            { categoryId: category.id },
            DetailLevel.MINIMAL
          )
        }

        return category
      })
    )
  }

  public static async getPath(groupId: number, path: any[] = []): Promise<GroupPath> {
    const group = await knex('Shop3Group')
      .select('_id as id', 'name', 'group as parentId')
      .where({ _id: groupId })
      .first()

    path.unshift(group)

    if (group.parentId) {
      return await this.getPath(group.parentId, path)
    }

    const groupPath = new GroupPath()

    groupPath.path = path.map((group: RepositoryPath) => ({
      id: group.id,
      name: group.name
    }))

    return groupPath
  }
}

function toNewCategory({ id, module, description, group, name }: RepositoryCategory) {
  const category = new Category(module)
  category.id = id
  category.name = name
  category.description = description
  category.group = group

  return category
}
