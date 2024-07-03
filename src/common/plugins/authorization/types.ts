export namespace AuthorizationPlugin {
  export type Config = {
    authorize: Authorize | Function
  }

  export enum Authorize {
    SUPERUSER,
    MODULE_MATCH
  }
}
