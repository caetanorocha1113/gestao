import fs from 'node:fs'
import pg from 'pg'
import { urlDireta } from '../src/db.js'

const sql = fs.readFileSync('../saep_db.sql', 'utf8')
const client = new pg.Client({ connectionString: urlDireta() })

await client.connect()
await client.query(sql)
await client.end()
console.log('Banco criado e populado!')
