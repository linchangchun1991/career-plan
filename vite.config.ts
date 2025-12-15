import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 1. 精确替换 process.env.API_KEY，避免暴露所有环境变量
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    // 2. 将 process.env 定义为空对象，防止 "process is not defined" 导致浏览器崩溃
    'process.env': {}
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '/compatible-mode/v1')
      }
    }
  }
});