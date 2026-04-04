import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production bundle → site/dist/ (deploy this folder, not the whole site/ tree).
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
