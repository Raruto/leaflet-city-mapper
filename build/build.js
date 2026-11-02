import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as esbuildBuild, context } from 'esbuild';

const options = {
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  sourcemap: true,
  outdir: 'dist',
  entryNames: 'leaflet-city-mapper-src',
  external: ['./3d/index.js'],
};
const typesOptions = {
  entryPoints: ['src/3d/**/*.js'],
  format: 'esm',
  minify: true,
  sourcemap: true,
  outbase: 'src/3d',
  outdir: 'dist/3d',
};
const builds = [options, { ...options, entryNames: 'leaflet-city-mapper', minify: true }, typesOptions];

export async function build({ watch = false } = {}) {
  await mkdir('dist', { recursive: true });
  if (!watch) {
    await Promise.all(builds.map(options => esbuildBuild(options)));
    return;
  }
  const builders = await Promise.all(builds.map(options => context(options)));
  await Promise.all(builders.map(builder => builder.watch()));
  return () => Promise.all(builders.map(builder => builder.dispose()));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build();
}
