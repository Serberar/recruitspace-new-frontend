import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimización de bundles
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,

    rollupOptions: {
      output: {
        // Chunk splitting strategy - función para manejar chunks dinámicamente
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'vendor-redux';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            // Resto de node_modules
            return 'vendor';
          }
        },

        // Asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500,
  },

  // Optimización para desarrollo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'react-hook-form',
      'zod',
      'axios',
      'i18next',
      'react-i18next',
    ],
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },

  // Preview configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
})
