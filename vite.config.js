import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://finnhub.io',
        changeOrigin: true,
        headers: {
          'X-Finnhub-Token': process.env.VITE_FINNHUB_API_KEY
        }
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
});
