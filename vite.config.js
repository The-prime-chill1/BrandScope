import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_SITE_URL, sitemapPlugin } from './scripts/generate-sitemap.js';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

  return {
    plugins: [
      react(),
      sitemapPlugin({
        siteUrl: env.SITE_URL || env.VITE_APP_URL || DEFAULT_SITE_URL,
        supabaseUrl: env.VITE_SUPABASE_URL,
        publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY
      })
    ],
    server: {
      port: 5173,
      host: true
    }
  };
});
