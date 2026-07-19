import { createApiClient, buildApi } from '@iki/shared'
import { useAuthStore } from '../store/auth'

const client = createApiClient(
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000',
  () => useAuthStore.getState().token
)

export const api = buildApi(client)
