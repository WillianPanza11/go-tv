// client/src/stores/auth.js
import { defineStore } from 'pinia'
import api from '../config/axios.js'

// Generador de UUID que funciona sin HTTPS
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
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
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(username, password) {
      const { data } = await api.post('/auth/login', { username, password })
      this.token = data.token
      localStorage.setItem('token', data.token)
    },

    logout() {
      this.token = null
      localStorage.removeItem('token')
    }
  }
})