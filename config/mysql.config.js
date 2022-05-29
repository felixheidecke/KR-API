const { env } = process;

export const host = env.MYSQL_HOST || 'localhost'
export const user = env.MYSQL_USER || null
export const database = env.MYSQL_DATABASE || null
export const password = env.MYSQL_PASSWORD || null