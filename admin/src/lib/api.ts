// admin/src/lib/api.ts
import { createApiClient, buildApi } from '../../shared/api'

const client = createApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  process.env.NEXT_PUBLIC_API_KEY || 'dev_key'
)

export const api = buildApi(client)
export type { Api } from '../../shared/api'
