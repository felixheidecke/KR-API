import { forEach } from 'lodash-es'

export default class SimpleQuery {
  #query = []

  select(select = '*') {
    if (!Array.isArray(select)) {
      select = [select]
    }

    this.#query = [...this.#query, 'SELECT', select.join()]

    return this
  }

  insertInto(table, data = null) {
    const keys = []
    const values = []

    forEach(data, (value, key) => {
      keys.push(`\`${key}\``)
      values.push(`'${value}'`)
    })

    this.#query = [
      ...this.#query,
      'INSERT INTO',
      table,
      `(${keys.join()})`,
      'VALUES',
      `(${values.join()})`
    ]
  }

  from(from) {
    this.#addToQuery('FROM', from)

    return this
  }

  where(where) {
    if (Array.isArray(where)) {
      where = where.join(' ')
    }

    this.#addToQuery('WHERE', where)

    return this
  }

  and(and) {
    if (Array.isArray(and)) {
      and = and.join(' ')
    }

    this.#addToQuery('AND', and)

    return this
  }

  or(or) {
    this.#addToQuery('OR', or)

    return this
  }

  leftJoin(table, on) {
    this.#query = [...this.#query, 'LEFT JOIN', table, 'ON', on]

    return this
  }

  limit(limit) {
    this.#addToQuery('LIMIT', limit)

    return this
  }

  group(group) {
    this.#addToQuery('GROUP BY', group)

    return this
  }

  order(order, direction = 'ASC') {
    this.#addToQuery('ORDER BY', order, direction)

    return this
  }

  get query() {
    return this.#query.join(' ')
  }

  #addToQuery() {
    const args = Array.from(arguments)
    this.#query = [...this.#query, ...args]
  }

  static eq(a, b) {
    return a + '=' + b
  }

  static neq(a, b) {
    return a + '!=' + b
  }

  static lt(a, b) {
    return a + '<' + b
  }

  static lte(a, b) {
    return a + '<=' + b
  }

  static gt(a, b) {
    return a + '>' + b
  }

  static gte(a, b) {
    return a + '>=' + b
  }
}
