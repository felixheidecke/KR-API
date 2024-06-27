import type Client from './Client.js'

export default class User {
  constructor(clientId?: number, moduleIds?: number[], isSuperuser?: boolean) {
    this.clientId = clientId || -1
    this.moduleIds = moduleIds || []
    this.isSuperuser = isSuperuser || false
  }

  clientId: number
  isSuperuser: boolean
  moduleIds: number[] = []

  public fromClient(client: Client) {
    this.clientId = client.id
    this.isSuperuser = client.isSuperuser
    this.moduleIds = client.authorizedModuleIds

    return this
  }
}
