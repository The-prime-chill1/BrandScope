import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_SITE_URL, sitemapPlugin } from './scripts/generate-sitemap.js';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

  return {
    resolve: {
      // Keep every dependency on the exact same React module instance.
      // This also protects local development after Vite re-optimizes chunks.
      dedupe: ['react', 'react-dom']
    },
    plugins: [
      react(),
      sitemapPlugin({
        siteUrl: env.SITE_URL || env.VITE_APP_URL || DEFAULT_SITE_URL,
        supabaseUrl: env.VITE_SUPABASE_URL,
        publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (!normalizedId.includes('/node_modules/')) return undefined;
            if (normalizedId.includes('/@supabase/') || normalizedId.includes('/iceberg-js/')) return 'vendor-supabase';
            if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/react-router')) return 'vendor-react';
            if (normalizedId.includes('/lucide-react/')) return 'vendor-icons';
            return 'vendor';
          }
        }
      }
    },
    server: {
      port: 5173,
      host: true
    }
  };
});
