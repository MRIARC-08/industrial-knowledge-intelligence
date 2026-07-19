import { createApiClient, buildApi } from '@iki/shared'
import { useAuthStore } from '../store/auth'

const client = createApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  () => useAuthStore.getState().token
)

export const api = buildApi(client)
export type { Api } from '@iki/shared'
