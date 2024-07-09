import { Group } from '../entities/Group.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { GroupPath } from '../entities/GroupPath.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { GroupRepo } from '../gateways/GroupRepo.js'

type BaseConfig = {
  skipModuleCheck?: boolean
  shouldThrow?: boolean
}

export class GroupService {
  /**
   * Retrieves a group based on module ID and group ID, with optional configurations.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The group identifier.
   * @param {BaseConfig} config - Configuration options for handling the group retrieval.
   * @returns {Promise<Group|null>} Returns a Group object or null if the group doesn't exist, based on the provided configurations.
   * @throws {HttpError} Throws an HTTP error if conditions defined in the config are met and the entity is not found.
   */
  public static async getGroup(
    module: number,
    id: number,
    { shouldThrow, skipModuleCheck }: BaseConfig = {}
  ) {
    const [moduleExists, repoGroup] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module, 'shop3') : Promise.resolve(true),
      GroupRepo.readGroup(module, id)
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoGroup && shouldThrow) {
      throw HttpError.NOT_FOUND('Group not found.')
    }

    if (!repoGroup) {
      return null
    }

    return this.createGroupFromRepo(repoGroup)
  }

  /**
   * Retrieves a group by product ID, within a specific module, with optional configurations.
   *
   * @param {number} module - The module identifier.
   * @param {number} id - The product identifier associated with the group.
   * @param {BaseConfig} config - Configuration options for handling the group retrieval.
   * @returns {Promise<Group|null>} Returns a Group object or null if no group associated with the product ID exists, based on the provided configurations.
   * @throws {HttpError} Throws an HTTP error if conditions defined in the config are met and the entity is not found.
   */
  public static async getGroupByProductId(
    module: number,
    id: number,
    { shouldThrow, skipModuleCheck }: BaseConfig = {}
  ) {
    const [moduleExists, repoGroup] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module, 'shop3') : Promise.resolve(true),
      GroupRepo.readGroupByProductId(module, id)
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoGroup && shouldThrow) {
      throw HttpError.NOT_FOUND('Group not found.')
    }

    return repoGroup ? this.createGroupFromRepo(repoGroup) : null
  }

  /**
   * Retrieves all groups in a specified module, with optional configurations.
   *
   * @param {number} module - The module identifier.
   * @param {BaseConfig} config - Configuration options for handling the group retrieval.
   * @returns {Promise<Array<Group>|null>} Returns an array of Group objects or null if no groups are found, based on the provided configurations.
   * @throws {HttpError} Throws an HTTP error if conditions defined in the config are met and the entity is not found.
   */
  public static async getGroups(module: number, { shouldThrow, skipModuleCheck }: BaseConfig = {}) {
    const [moduleExists, repoGroups] = await Promise.all([
      skipModuleCheck ? ModuleRepo.moduleExists(module, 'shop3') : Promise.resolve(true),
      GroupRepo.readGroups(module, null)
    ])

    if (!moduleExists && shouldThrow) {
      throw HttpError.NOT_FOUND('Module not found.')
    }

    if (!repoGroups && shouldThrow) {
      throw HttpError.NOT_FOUND('Categories not found.')
    }

    return repoGroups ? repoGroups.map(GroupService.createGroupFromRepo) : null
  }

  /**
   * Creates a Group instance from a repository group data.
   *
   * @param {GroupRepo.Group} repoGroup - The repository group data.
   * @returns {Group} Returns a Group instance populated with data from the repository.
   * @private
   */
  private static createGroupFromRepo(repoGroup: GroupRepo.Group): Group {
    const group = new Group(repoGroup.module)

    group.id = repoGroup._id
    group.name = repoGroup.name
    group.description = repoGroup.description
    group.group = repoGroup.group || undefined

    if (repoGroup.path) {
      group.path = GroupService.createGroupPathFromRepo(repoGroup.path)
    }

    if (repoGroup.subgroups) {
      group.subgroups = repoGroup.subgroups.map(GroupService.createGroupFromRepo)
    }

    return group
  }

  /**
   * Converts repository group path data into a GroupPath instance.
   *
   * @param {GroupRepo.GroupPath[]} repoGroupPath - Array of repository group path data.
   * @returns {GroupPath} Returns a GroupPath instance constructed from repository data.
   * @private
   */
  private static createGroupPathFromRepo(repoGroupPath: GroupRepo.GroupPath[]): GroupPath {
    const groupPath = new GroupPath()

    groupPath.path = repoGroupPath.map(({ _id, name }) => ({ id: _id, name }))

    return groupPath
  }
}
