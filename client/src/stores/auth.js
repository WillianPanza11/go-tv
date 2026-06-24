// client/src/stores/auth.js
import { defineStore } from 'pinia'
import api from '../config/axios.js'

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const decodeToken = (token) => {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return {}
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    sessionId: localStorage.getItem('sessionId') || (() => {
      const id = generateUUID()
      localStorage.setItem('sessionId', id)
      return id
    })()
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isGuest: (state) => {
      if (!state.token) return false
      return decodeToken(state.token).role === 'guest'
    }
  },

  actions: {
    async login(username, password) {
      const { data } = await api.post('/auth/login', { username, password })
      this.token = data.token
      localStorage.setItem('token', data.token)
    },

    async loginAsGuest() {
      const { data } = await api.post('/auth/guest')
      this.token = data.token
      localStorage.setItem('token', data.token)
    },

    logout() {
      this.token = null
      localStorage.removeItem('token')
    }
  }
})