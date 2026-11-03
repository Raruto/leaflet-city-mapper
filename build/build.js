import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as esbuildBuild, context } from 'esbuild';

const options = {
  entryPoints: [
    { in: 'src/index.js', out: 'leaflet-city-mapper' },
    'src/types/**/*.js',
    'src/utils/**/*.js',
  ],
  format: 'esm',
  minify: true,
  sourcemap: true,
  define: { 'import.meta': 'null' },
  outbase: 'src',
  outdir: 'dist',
};

export async function build({ watch = false } = {}) {
  await mkdir('dist', { recursive: true });
  if (!watch) {
    await esbuildBuild(options);
    await Promise.all(['dist/index.js', 'dist/index.js.map'].map(file => rm(file, { force: true })));
    return;
  }
  const builder = await context(options);
  await Promise.all(['dist/index.js', 'dist/index.js.map'].map(file => rm(file, { force: true })));
  await builder.watch();
  return () => builder.dispose();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build();
}
