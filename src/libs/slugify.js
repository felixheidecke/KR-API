import { format } from 'date-fns'
import slugify from 'slugify'

export const toFilenameWithDate = (name, appendix = false) => {
  const filename = [
    slugify(name, { lower: true, strict: true, trim: true }),
    format(new Date(), 't')
  ]

  if (appendix) {
    filename.push(appendix)
  }

  return filename.join('.')
}

export const toUrlSlug = (string) => {
  return slugify(string, {
    lower: true,
    locale: 'de',
    remove: /[*+~.,/()'"!?:@]/g
  })
}

export default { slugify }
