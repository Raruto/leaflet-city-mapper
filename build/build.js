import { mkdir, rm } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as esbuildBuild, context } from 'esbuild';

const options = {
  entryPoints: [
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
  const mainOptions = {
    ...options, entryPoints: [{ in: 'src/index.js', out: 'leaflet-city-mapper' }], bundle: true,
    plugins: [{
      name: 'lazy-utilities',
      setup(builder) {
        builder.onResolve({ filter: /^\./ }, args => args.kind === 'dynamic-import' ? {
          path: './' + relative(resolve('src'), resolve(args.resolveDir, args.path)).replaceAll('\\', '/'),
          external: true,
        } : undefined);
      },
    }],
  };
  const main = watch ? await context(mainOptions) : null;
  if (!watch) {
    await Promise.all([esbuildBuild(options), esbuildBuild(mainOptions)]);
    await Promise.all(['dist/index.js', 'dist/index.js.map'].map(file => rm(file, { force: true })));
    return;
  }
  const builder = await context(options);
  await Promise.all(['dist/index.js', 'dist/index.js.map'].map(file => rm(file, { force: true })));
  await Promise.all([builder.watch(), main.watch()]);
  return () => Promise.all([builder.dispose(), main.dispose()]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build();
}
