import type Client from './client.js'

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

  clone() {
    return new User(this.clientId, this.moduleIds, this.isSuperuser)
  }

  serialize() {
    return {
      clientId: this.clientId,
      isSuperuser: this.isSuperuser,
      moduleIds: this.moduleIds
    }
  }

  static deserialize(data: any) {
    return new User(data.clientId, data.moduleIds, data.isSuperuser)
  }
}
