import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5750',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: (moduleId) => {
          if (moduleId.includes('node_modules/react') || moduleId.includes('node_modules/react-dom') || moduleId.includes('node_modules/react-router-dom')) return 'react-vendor'
          if (moduleId.includes('node_modules/framer-motion') || moduleId.includes('node_modules/lucide-react')) return 'ui-vendor'
          if (moduleId.includes('node_modules/axios')) return 'http-vendor'
          return undefined
        }
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5750/api')
  }
})
