import Client from '../entities/client.js'
import { ClientRepo } from '../providers/client-repo.js'
import { createSha512_256Hash } from '#utils/hash.js'
import { ModuleServiceUtils } from './module-service.js'
import { ModuleRepo } from '../providers/module-repo.js'
import { HttpError } from '#utils/http-error.js'

// --- [ Namespace ] -------------------------------------------------------------------------------

export type GetClient = {
  (id: number): Promise<Client>
}

export type GetClientByApiKey = (apiKey: string) => Promise<Client>

export type CreateClientFromRepo = (
  repoClient: ClientRepo.Client,
  repoModules?: ModuleRepo.Module[]
) => Client

// --- [ Class ] -----------------------------------------------------------------------------------

export class ClientService {
  /**
   * Retrieves a client by its ID.
   * @param id - The ID of the client to retrieve.
   * @returns {Client} A Promise that resolves to the client object, or null if the client is not found.
   * @throws {HttpError} If the client is not found.
   */
  public static getClient: GetClient = async id => {
    const [repoClient, repoClientModules] = await Promise.all([
      ClientRepo.readClient(id),
      ModuleRepo.readModulesByClient(id)
    ])

    if (!repoClient) {
      throw HttpError.NOT_FOUND('Client not found.')
    }

    return this.createClientFromRepo(repoClient, repoClientModules || undefined)
  }

  /**
   * Retrieves a client by their API key.
   * @param apiKey - The API key of the client.
   * @returns {Client} The client object if found, or null if not found.
   * @throws {HttpError} if the client is not found.
   */
  public static getClientByApiKey: GetClientByApiKey = async apiKey => {
    const repoClient = await ClientRepo.readClientByApiKey(createSha512_256Hash(apiKey))

    if (!repoClient) {
      throw HttpError.NOT_FOUND('Client not found.')
    }

    const clientModules = (await ModuleRepo.readModulesByClient(repoClient.id)) || undefined

    return this.createClientFromRepo(repoClient, clientModules)
  }

  /**
   * Maps a repository module to a Module entity.
   * @param {RepoModule} repoModule - The repository module to map.
   * @returns {Module} - The mapped Module entity.
   */
  public static createClientFromRepo: CreateClientFromRepo = (repoClient, repoModules) => {
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
