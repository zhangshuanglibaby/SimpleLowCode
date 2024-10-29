import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'
import { isVue2 } from 'vue-demi'

// https://vite.dev/config/
// 管理打包时根据使用vue不同版本输出不同文件夹名称
const name = isVue2 ? 'vue2' : 'vue3'

export default defineConfig({
  // plugins: [vue()],
  plugins: [isVue2 ? createVuePlugin() : vue()],
  build: {
    outDir: `dist/${name}`,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'), // 设置入口文件
      name: 'simple',
      fileName: 'simple' // 打包后的文件名
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'vue-demi'],
      // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      output: {
        globals: {
          vue: 'Vue',
          'vue-demi': 'VueDemi'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
