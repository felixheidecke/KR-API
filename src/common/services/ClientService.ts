import Client from '../entities/Client.js'
import { ClientRepo } from '../gateways/ClientRepo.js'
import { createSha512_256Hash } from '../utils/hash.js'
import { ModuleServiceUtils } from './ModuleService.js'
import { ModuleRepo } from '../gateways/ModuleRepo.js'
import { HttpError } from '../decorators/Error.js'

export class ClientService {
  /**
   * Retrieves a client by its ID.
   * @param id - The ID of the client to retrieve.
   * @returns {Client} A Promise that resolves to the client object, or null if the client is not found.
   * @throws {HttpError} If the client is not found and the `shouldThrow` flag is set to true.
   */
  public static async getClient(
    id: number,
    config: {
      shouldThrow?: boolean
    } = {}
  ): Promise<Client | null> {
    const [repoClient, clientModules] = await Promise.all([
      ClientRepo.readClient(id),
      ModuleRepo.readModulesByClient(id)
    ])

    if (!repoClient && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Client not found.')
    }

    return repoClient
      ? ClientServiceUtils.createClientFromRepo(repoClient, clientModules || undefined)
      : null
  }

  /**
   * Retrieves a client by their API key.
   * @param apiKey - The API key of the client.
   * @returns {Client} The client object if found, or null if not found.
   * @throws {HttpError} if the client is not found and `shouldThrow` is true.
   */
  public static async getClientByApiKey(
    apiKey: string,
    config: {
      shouldThrow?: boolean
    } = {}
  ): Promise<Client | null> {
    const repoClient = await ClientRepo.readClientByApiKey(createSha512_256Hash(apiKey))

    if (!repoClient && config.shouldThrow) {
      throw HttpError.NOT_FOUND('Client not found.')
    }

    if (!repoClient) {
      return null
    }

    const clientModules = (await ModuleRepo.readModulesByClient(repoClient.id)) || undefined

    return ClientServiceUtils.createClientFromRepo(repoClient, clientModules)
  }
}

export class ClientServiceUtils {
  /**
   * Maps a repository module to a Module entity.
   * @param {RepoModule} repoModule - The repository module to map.
   * @returns {Module} - The mapped Module entity.
   */
  public static createClientFromRepo(
    repoClient: ClientRepo.Client,
    repoModules?: ModuleRepo.Module[]
  ): Client {
    const client = new Client(repoClient.id)

    client.login = repoClient.login
    client.isSuperuser = !!repoClient.superuser
    client.lastLogin = repoClient.lastLogin

    if (repoModules && repoModules.length) {
      client.authorizedModules = repoModules.map(ModuleServiceUtils.createModuleFromRepo)
    }

    return client
  }
}
