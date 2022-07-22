export const andGroup = (array) => {
  return `(${array.join(' AND ')})`
}

export const orGroup = (array) => {
  return `(${array.join(' OR ')})`
}

export default class mysqlQuery {
  constructor() {
    this._select = []
    this._from
    this._where = []
    this._limit = false
    this._order = false
  }

  select(s) {
    if (s === '*') this._select = ['*']
    else this._select.push(s)
    return this
  }

  from(f) {
    this._from = f.trim()
    return this
  }

  where(where) {
    this._where.push(where)
    return this
  }

  and(and) {
    if (Array.isArray(and)) {
      and = `( ${and.join(' ')} )`
    }

    this._where.push(`AND ${and}`)
    return this
  }

  or(or) {
    if (Array.isArray(or)) {
      or = `( ${or.join(' ')} )`
    }

    this._where.push(`OR ${or}`)
    return this
  }

  limit(limit) {
    this._limit = `LIMIT ${parseInt(limit)}`
    return this
  }

  order(order, dir = 'ASC') {
    this._order = `ORDER BY ${order} ${dir}`
    return this
  }

  query = () => {
    const query = [
      'SELECT',
      this._select.join(','),
      'FROM',
      this._from,
      'WHERE',
      ...this._where
    ]

    if (this._order) query.push(this._order)
    if (this._limit) query.push(this._limit)

    return query.join(' ')
  }
}
