import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    userName: null
  }),
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('accessToken', token)
    },
    setUserName(name) {
      this.userName = name
    },
    clearToken() {
      this.token = null
      localStorage.removeItem('accessToken')
    }
  }
})
