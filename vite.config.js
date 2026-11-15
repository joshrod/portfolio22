import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

// Every .html file in the project root is its own page.
const pages = Object.fromEntries(
	readdirSync(root)
		.filter((file) => file.endsWith('.html'))
		.map((file) => [file.replace(/\.html$/, ''), resolve(root, file)])
);

export default defineConfig({
	build: {
		rollupOptions: {
			input: pages,
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				// TODO: migrate src/scss from @import to @use/@forward, then remove this.
				silenceDeprecations: ['import'],
			},
		},
	},
});
