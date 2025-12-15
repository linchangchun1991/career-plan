import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 这里的顺序很重要。
    // 1. 先定义特定的环境变量字符串替换，确保代码中的 process.env.API_KEY 被正确替换为字符串值
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    
    // 2. 为其他第三方库可能用到的 process.env 提供一个空对象兜底，
    //    防止出现 "Uncaught ReferenceError: process is not defined" 错误。
    //    注意：Vite 在生产构建时会自动处理 process.env.NODE_ENV
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