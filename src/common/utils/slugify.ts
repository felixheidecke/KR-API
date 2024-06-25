import slugify from 'slugify'

export const toFilenameWithDate = (name: string, appendix = '') => {
  // @ts-ignore
  const filename = [slugify(name, { lower: true, strict: true, trim: true })]

  if (appendix) {
    filename.push(appendix)
  }

  return filename.join('.')
}

export const toUrlSlug = (string: string, maxlength?: number): string => {
  // @ts-ignore
  return slugify(string, {
    lower: true,
    locale: 'de',
    remove: /[*+~.,/()\[\]'"!?:@]/g
  }).substring(0, maxlength || 100)
}

export default { slugify }
