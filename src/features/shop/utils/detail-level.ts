export enum DetailLevel {
  MINIMAL = -1,
  DEFAULT = 0,
  EXTENDED = 1
}

export function mapDetailLevel(level?: 'minimal' | 'default' | 'extended'): DetailLevel {
  switch (level) {
    case 'minimal':
      return DetailLevel.MINIMAL
    case 'extended':
      return DetailLevel.EXTENDED
    case 'default':
    default:
      return DetailLevel.DEFAULT
  }
}
