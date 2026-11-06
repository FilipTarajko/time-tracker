import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      src: r('./src'),
      app: r('./'),
      components: r('./src/components'),
      layouts: r('./src/layouts'),
      pages: r('./src/pages'),
      assets: r('./src/assets'),
      boot: r('./src/boot'),
      stores: r('./src/stores'),
    },
  },
});
