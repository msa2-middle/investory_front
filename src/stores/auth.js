import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('accessToken') || null
  }),
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('accessToken', token)
    },
    clearToken() {
      this.token = null
      localStorage.removeItem('accessToken')
    }
  }
})
