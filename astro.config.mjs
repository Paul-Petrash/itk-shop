// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://itk-shop.ru',
  integrations: [preact(), sitemap()],
  build: {
    // 'auto' (по умолчанию) — инлайнит если < assetsInlineLimit
    // 'always'              — всё инлайн в <style>
    // 'never'               — всё отдельными файлами
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 8048,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('?astro')) return;
            if (
              id.includes('node_modules/preact') ||
              id.includes('node_modules/@preact') ||
              id.includes('@astrojs/preact') ||
              id.includes('src/components/')
            ) {
              return 'app';
            }
          },
        },
      },
    },
  },
});
