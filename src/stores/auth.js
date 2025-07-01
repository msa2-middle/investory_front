// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('accessToken'),
    userName: null,
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('accessToken', token);
    },
    setUserName(name) {
      this.userName = name;
    },
    clearToken() {
      this.token = null;
      this.userName = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken')
    }
  }
})
