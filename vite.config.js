import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      // ensure everyone uses the same three build
      three: path.resolve(__dirname, 'node_modules/three'),
    },
    dedupe: ['react', 'react-dom', 'three'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
  },
})
