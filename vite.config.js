import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署到 https://lhr0728.github.io/DNA-teaching-aids/
  // 需要将 base 设置为仓库名路径，确保资源引用正确
  base: '/DNA-teaching-aids/',
})
