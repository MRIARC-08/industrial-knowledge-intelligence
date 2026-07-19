import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

interface AuthState {
  token: string | null
  role: string | null
  setAuth: (token: string, role: string) => void
  logout: () => void
  loadToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  setAuth: (token, role) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('user_role', role)
    } else {
      SecureStore.setItemAsync('jwt_token', token).catch(console.error)
      SecureStore.setItemAsync('user_role', role).catch(console.error)
    }
    set({ token, role })
  },
  logout: () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user_role')
    } else {
      SecureStore.deleteItemAsync('jwt_token').catch(console.error)
      SecureStore.deleteItemAsync('user_role').catch(console.error)
    }
    set({ token: null, role: null })
  },
  loadToken: async () => {
    try {
      let token, role;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('jwt_token')
        role = localStorage.getItem('user_role')
      } else {
        token = await SecureStore.getItemAsync('jwt_token')
        role = await SecureStore.getItemAsync('user_role')
      }
      
      if (token && role) {
        set({ token, role })
      }
    } catch (e) {
      console.error('Failed to load token', e)
    }
  }
}))
