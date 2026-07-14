// mobile/src/lib/api.ts
import { createApiClient, buildApi } from '@iki/shared'

// React Native uses different env variable syntax
const client = createApiClient(
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000', // Mock fallback
  process.env.EXPO_PUBLIC_API_KEY || 'dev_key'
)

export const api = buildApi(client)
