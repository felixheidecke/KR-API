import database from '#libs/database'
import mysqlQuery from '#utils/sql-query-builder'

export const getEmailAddress = async (id) => {
  const db = new mysqlQuery()

  db
    .select('email')
    .from('Formmail')
    .where('id = ?')
    .limit(1)

  try {
    const [rows] = await database.execute(db.query(), [id])

    if (!rows.length) {
      return null
    }

    return rows[0].email || null
  } catch (error) {
    console.error(error)
    return error
  }
}