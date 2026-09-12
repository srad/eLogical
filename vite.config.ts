import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

// The app is fully offline — it talks to IndexedDB only, so there is no dev proxy.
export default defineConfig({
  plugins: [
    vue(),
    // ANALYZE=1 npm run build -> writes stats.html (gitignored)
    ...(process.env.ANALYZE
      ? [visualizer({ open: true, gzipSize: true, brotliSize: true })]
      : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080
  },
  build: {
    outDir: 'dist',
    // minSdk 31 means an Android 12+ WebView; keep this in step with tsconfig target.
    target: 'es2022',
    sourcemap: false
  }
})
