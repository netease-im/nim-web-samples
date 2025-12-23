import react from '@vitejs/plugin-react';

import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// 读取 node_modules 中 nim-web-sdk-ng 的真实版本
const nimSdkPackageJsonPath = path.resolve('./node_modules/nim-web-sdk-ng/package.json');
let nimSdkVersion = 'unknown';
try {
  const nimSdkPackageJson = JSON.parse(fs.readFileSync(nimSdkPackageJsonPath, 'utf-8'));
  nimSdkVersion = nimSdkPackageJson.version || 'unknown';
} catch (error) {
  console.warn('无法读取 nim-web-sdk-ng 版本:', error);
}

// https://vite.dev/config/
export default defineConfig({
  base: '/public-resources/web-sample-code-for-im/',
  define: {
    __NIM_SDK_VERSION__: JSON.stringify(nimSdkVersion),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(''), './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.mdx', '.json'],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 可以在这里添加全局 less 变量
        // additionalData: `@import "@/styles/variables.less";`
      },
    },
  },
});
