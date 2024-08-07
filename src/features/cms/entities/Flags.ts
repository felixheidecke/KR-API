export class Flags {
  constructor(flags: string[] = []) {
    this.flags = flags
  }

  private _flags = new Set<string>()

  // --- [ Getter ] -------------------------------------------------------------------------------

  public get flags() {
    return Array.from(this._flags)
  }

  public get length() {
    return this._flags.size
  }

  // --- [ Setter ] -------------------------------------------------------------------------------

  public set flags(flags: string[]) {
    const normalisedFlags = flags.map(flag => flag.trim().toLocaleLowerCase('de-DE'))

    this._flags = new Set(normalisedFlags)
  }

  // --- [ Methods ] -------------------------------------------------------------------------------

  public add(flag: string) {
    this._flags.add(flag)
  }

  public remove(flag: string) {
    this._flags.delete(flag)
  }

  public has(flag: string) {
    return this._flags.has(flag)
  }

  public display() {
    return this.flags
  }
}
