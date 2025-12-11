import dotenv from 'dotenv'
import path from 'path'

const envPath = path.resolve(__dirname, '..', '..', '.env')
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  console.warn(`[ENV] Failed to load .env from ${envPath}`, envResult.error)
} else {
  console.log(`[ENV] Loaded .env from ${envPath}`)
  console.log(`[ENV] Keys loaded: ${Object.keys(envResult.parsed || {}).join(', ') || 'none'}`)
}

