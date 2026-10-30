import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'node:path';
export default defineConfig({root: resolve('apps/web'), plugins:[solid()], build:{outDir:'dist',emptyOutDir:true}});
