import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
    cors: {
      origin: ['http://localhost:3000', 'https://0x10.kr', 'http://0x10.kr'],
      credentials: true
    }
  },
  preview: {
    port: 4173,
    cors: {
      origin: ['http://localhost:4173', 'https://0x10.kr', 'http://0x10.kr'],
      credentials: true
    }
  },
  define: {
    'process.env.DATA_SOURCE_PATH': JSON.stringify(process.env.DATA_SOURCE_PATH || '../repo_data')
  },
  envPrefix: ['VITE_']
})