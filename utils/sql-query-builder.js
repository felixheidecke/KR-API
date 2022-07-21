export default class mysqlQuery {

  constructor() {
    this._select = [];
    this._from;
    this._where = { and: [], or: [] };
    this._limit = '';
    this._order = '';
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

  where(operation) {
    this._where.and.push(operation)
    return this
  }

  or(operation) {
    this._where.or.push(operation)
    return this
  }

  limit(limit) {
    this._limit = `LIMIT ${parseInt(limit)}`
    return this
  }

  order(order) {
    this._order = `ORDER BY ${order} ASC`
    return this
  }

  query = () => {
    const query = [
      'SELECT',
      this._select.join(','),
      'FROM',
      this._from,
    ]

    query.push(this._buildWhereQuery())
    query.push(this._order)
    query.push(this._limit)

    return query.join(' ')
  }

  // --- private ---

  get _hasWhere() {
    return this._where.and.length || this._where.or.length
  }

  _buildWhereQuery() {
    const query = []

    if (this._hasWhere) {
      const and = this._where.and;
      const or = this._where.or;

      query.push('WHERE', and.join(' AND '))

      if (or.length === 1) {
        query.push('OR', or[0])
      }

      else if (or.length > 1) {
        query.push('AND (', or.join(' OR '), ')')
      }

    }

    return query.join(' ')
  }
}