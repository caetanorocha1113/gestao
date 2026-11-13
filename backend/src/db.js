import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

export function urlDireta() {
  const url = process.env.DATABASE_URL
  if (!url.startsWith('prisma+postgres://')) return url

  const apiKey = new URL(url).searchParams.get('api_key')
  const { databaseUrl } = JSON.parse(Buffer.from(apiKey, 'base64url').toString())
  return databaseUrl.split('?')[0] + '?sslmode=disable'
}

const adapter = new PrismaPg({ connectionString: urlDireta() })
export const prisma = new PrismaClient({ adapter })
