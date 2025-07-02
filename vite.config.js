import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 히스토리 API 폴백 설정
    historyApiFallback: true,
    proxy: {
      '/main': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
      },
      // API 요청만 프록시 (더 구체적인 경로로 변경)
      '/api': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
