import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'; // <-- 1. Importa path para resolver la ruta absoluta

export default defineConfig({
  // 2. Agrega la sección de resolución de alias
  resolve: {
    alias: {
      html2canvas: path.resolve(__dirname, 'node_modules/html2canvas-pro'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // <-- Evita que el Service Worker interfiera mientras usas 'npm run dev'
      },
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'Auditoria SW',
        short_name: 'AuditoriaSW',
        description: 'Aplicación de Auditoría SW',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ]
});