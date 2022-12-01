import database from '#libs/database'
import mysqlQuery from '#libs/sql-query-builder'

/**
 * Fetch a list of email adresses
 *
 * @param {number[]|string[]} ids list of id matching rtd.Formmail
 * @returns {Promise<string[]>} list of email addresses
 */

export const getEmailAddress = async (ids) => {
  const db = new mysqlQuery()

  db.select('email')
    .from('Formmail')
    .or(ids.map((id) => `id = ${id}`))

  const [rows] = await database.execute(db.query())

  if (!rows.length) return []

  return rows.map(({ email }) => email)
}
