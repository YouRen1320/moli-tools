// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages 项目站点：部署在 https://youren1320.github.io/youren-tools/ 子路径下
export default defineConfig({
  site: 'https://youren1320.github.io',
  base: '/youren-tools',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
