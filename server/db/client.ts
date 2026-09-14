import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let pool: Pool | undefined
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw createError({ statusCode: 500, statusMessage: 'DATABASE_URL is not configured' })
    }
    pool = new Pool({ connectionString })
    dbInstance = drizzle(pool, { schema })
  }
  return dbInstance
}
