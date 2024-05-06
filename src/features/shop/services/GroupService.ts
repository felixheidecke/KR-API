import { Group } from '../entities/Group.js'
import { ModuleRepo } from '../../../common/gateways/ModuleRepo.js'
import { GroupPath } from '../entities/GroupPath.js'
import { HttpError } from '../../../common/decorators/Error.js'
import { GroupRepo } from '../gateways/GroupRepo.js'

export class GroupService {
  /**
   * Retrieves a single group based on module and group ID with optional error handling.
   *
   * @param {number} module - The module ID.
   * @param {number} id - The group ID.
   * @param {object} [config={}] - Configuration options.
   * @param {boolean} [config.shouldThrow=false] - Flag to throw an error if the group or module doesn't exist.
   * @returns {Promise<Group|null>} The requested group or null if not found, wrapped in a Promise.
   * @throws {HttpError} Throws NOT_FOUND if the group or module is not found and shouldThrow is true.
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

  public static async getGroupByProductId(
    module: number,
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ) {
    const [moduleExists, repoGroup] = await Promise.all([
      ModuleRepo.moduleExists(module, 'shop3'),
      GroupRepo.readGroupByProductId(module, id)
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

  /**
   * Retrieves multiple groups based on a module ID with optional error handling.
   *
   * @param {number} module - The module ID.
   * @param {object} [config={}] - Configuration options.
   * @param {boolean} [config.shouldThrow=false] - Flag to throw an error if no groups or module are found.
   * @returns {Promise<Array<Group>|null>} An array of groups or null if no groups are found, wrapped in a Promise.
   * @throws {HttpError} Throws NOT_FOUND if no groups or the module is not found and shouldThrow is true.
   */
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

/**
 * Converts a repository group object into a Group entity.
 *
 * @param {GroupRepo.Group} repoGroup - The repository group object to convert.
 * @returns {Group} The converted Group entity.
 */
function createGroupFromRepo(repoGroup: GroupRepo.Group): Group {
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

/**
 * Converts repository group path data into a GroupPath entity.
 *
 * @param {Array<GroupRepo.GroupPath>} repoGroupPath - The array of repository group paths to convert.
 * @returns {GroupPath} The converted GroupPath entity.
 */
function createGroupPathFromRepo(repoGroupPath: GroupRepo.GroupPath[]): GroupPath {
  const groupPath = new GroupPath()

  groupPath.path = repoGroupPath.map(({ _id, name }) => ({ id: _id, name }))

  return groupPath
}
