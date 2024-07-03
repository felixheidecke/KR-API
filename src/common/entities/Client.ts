import { isNumber } from 'lodash-es'
import { fromUnixTime } from 'date-fns'
import type Module from './Module.js'

export default class Client {
  constructor(readonly id: number) {}

  public login = ''
  public isSuperuser = false
  protected _authorizedModules: Module[] = []
  protected _authorizedModuleIds: number[] = []
  protected _lastLogin?: Date

  // --- [ Getter ] --------------------------------------------------------------------------------

  public get authorizedModules(): Module[] {
    return this._authorizedModules
  }

  public get lastLogin(): Date | undefined {
    return this._lastLogin
  }

  public get authorizedModuleIds(): number[] {
    return this.authorizedModules.map(({ id }) => id)
  }

  // --- [ Setter ] --------------------------------------------------------------------------------

  public set authorizedModules(modules: Module[]) {
    this._authorizedModules = modules
    this._authorizedModuleIds = modules.map(({ id }) => id)
  }

  public set lastLogin(date: Date | number | string) {
    this._lastLogin = isNumber(date) ? fromUnixTime(date) : new Date(date)
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public serialize() {
    return {
      id: this.id,
      login: this.login,
      isSuperuser: this.isSuperuser,
      authorizedModuleIds: this.authorizedModuleIds,
      lastLogin: this.lastLogin?.toISOString()
    }
  }

  public display() {
    return Object.freeze({
      login: this.login,
      isSuperuser: this.isSuperuser,
      authorizedModules: this.authorizedModules.map(module => module.display()),
      lastLogin: this.lastLogin?.toISOString()
    })
  }
}
