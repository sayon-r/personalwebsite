// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` is the canonical domain: used for the sitemap, link previews and canonical URLs.
export default defineConfig({
  site: 'https://sayonramanan.com',
  integrations: [sitemap()],
});
