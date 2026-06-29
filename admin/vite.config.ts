import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: Infinity,
    cssCodeSplit: false,
    minify: 'esbuild',
  },
  server: {
    proxy: {
      '/kf': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/ai_status': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/system_prompt': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/get_access_token': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
