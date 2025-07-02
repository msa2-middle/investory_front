// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('accessToken'),
    userName: null,
    role: null,
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('accessToken', token);

       if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.role = payload.role;
      } else {
        this.role = null;
      }
    },
    setUserName(name) {
      this.userName = name;
    },
    clearToken() {
      this.token = null;
      this.userName = null;
      this.role = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken')
    }
  }
})
