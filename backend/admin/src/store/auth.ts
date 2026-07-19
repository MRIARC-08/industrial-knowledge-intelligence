import { create } from 'zustand'

interface AuthState {
  token: string | null
  role: string | null
  setAuth: (token: string, role: string) => void
  logout: () => void
  loadToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  setAuth: (token, role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('user_role', role)
    }
    set({ token, role })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user_role')
    }
    set({ token: null, role: null })
  },
  loadToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token')
      const role = localStorage.getItem('user_role')
      if (token && role) {
        set({ token, role })
      }
    }
  }
}))
