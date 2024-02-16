export enum DetailLevel {
  MINIMAL = -2,
  BASIC = -1,
  FULL = 0,
  EXTENDED = 1
}

export function mapDetailLevel(level?: 'minimal' | 'basic' | 'full' | 'extended'): DetailLevel {
  switch (level) {
    case 'minimal':
      return DetailLevel.MINIMAL
    case 'basic':
      return DetailLevel.BASIC
    case 'full':
      return DetailLevel.FULL
    case 'extended':
      return DetailLevel.EXTENDED
    default:
      return 0
  }
}
