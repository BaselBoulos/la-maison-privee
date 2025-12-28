import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(__dirname, '..', '..', '.env')

// Only try to load .env file if it exists (for local development)
// In production (Render), environment variables are set in the dashboard
if (fs.existsSync(envPath)) {
  const envResult = dotenv.config({ path: envPath })
  
  if (envResult.error) {
    console.warn(`[ENV] Failed to load .env from ${envPath}`, envResult.error)
  } else {
    console.log(`[ENV] Loaded .env from ${envPath}`)
    console.log(`[ENV] Keys loaded: ${Object.keys(envResult.parsed || {}).join(', ') || 'none'}`)
  }
} else {
  console.log(`[ENV] No .env file found at ${envPath} - using environment variables from system`)
}

