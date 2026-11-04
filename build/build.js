import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as esbuildBuild, context } from 'esbuild';

const options = {
  entryPoints: ['src/index.js'],
  outfile: 'dist/leaflet-city-mapper.js',
  bundle: true,
  format: 'iife',
  minify: true,
  define: { 'import.meta': 'null' },
  sourcemap: true,
};

export async function build({ watch = false } = {}) {
  if (!watch) return esbuildBuild(options);
  const builder = await context(options);
  await builder.watch();
  return () => builder.dispose();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build();
}
