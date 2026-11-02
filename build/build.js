import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as esbuildBuild, context } from 'esbuild';

const options = {
  entryPoints: ['src/**/*.js'],
  format: 'esm',
  minify: true,
  sourcemap: true,
  outbase: 'src',
  outdir: 'dist',
};

export async function build({ watch = false } = {}) {
  await mkdir('dist', { recursive: true });
  if (!watch) {
    await esbuildBuild(options);
    return;
  }
  const builder = await context(options);
  await builder.watch();
  return () => builder.dispose();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build();
}
