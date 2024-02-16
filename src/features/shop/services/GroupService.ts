import * as GroupRepo from '../gateways/GroupRepo.js'
import { Group } from '../entities/Group.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { GroupPath } from '../entities/GroupPath.js'
import { HttpError } from '../../../common/decorators/Error.js'

export class GroupService {
  /**
   * Retrieves a specific category by its ID.
   *
   * @param {number} module - The module number.
   * @param {number} id - The ID of the category to be retrieved.
   * @returns {Promise<Group>} A promise that resolves to the retrieved category.
   * @throws {HttpError} If the category is not found.
   */

  public static async getGroup(
    module: number,
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const [moduleExists, repoGroup] = await Promise.all([
      ModuleRepo.moduleExists(module, 'shop3'),
      GroupRepo.readGroup(module, id)
    ])

    if (config.shouldThrow && !moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (config.shouldThrow && !repoGroup) {
      throw HttpError.NOT_FOUND('Group not found.')
    }

    if (!repoGroup) {
      return null
    }

    return this.utils.createCategoryFromRepo(repoGroup)
  }

  public static async getGroups(
    module: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const [moduleExists, repoGroups] = await Promise.all([
      ModuleRepo.moduleExists(module, 'shop3'),
      GroupRepo.readGroups(module, null)
    ])

    if (config.shouldThrow && !moduleExists) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (config.shouldThrow && !repoGroups) {
      throw HttpError.NOT_FOUND('Categories not found.')
    }

    return repoGroups ? repoGroups.map(createGroupFromRepo) : null
  }

  static get utils() {
    return {
      createCategoryFromRepo: createGroupFromRepo,
      createCategoryPathFromRepo: createGroupPathFromRepo
    }
  }
}

// --- [ Utility functions ] -----------------------------------------------------------------------

function createGroupFromRepo(repoGroup: GroupRepo.RepoGroup): Group {
  const group = new Group(repoGroup.module)

  group.id = repoGroup._id
  group.name = repoGroup.name
  group.description = repoGroup.description
  group.group = repoGroup.group || undefined

  if (repoGroup.path) {
    group.path = createGroupPathFromRepo(repoGroup.path)
  }

  if (repoGroup.subgroups) {
    group.subgroups = repoGroup.subgroups.map(createGroupFromRepo)
  }

  return group
}

function createGroupPathFromRepo(repoGroupPath: GroupRepo.RepoGroupPath[]): GroupPath {
  const groupPath = new GroupPath()

  groupPath.path = repoGroupPath.map(({ _id, name }) => ({ id: _id, name }))

  return groupPath
}
