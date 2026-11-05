import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as esbuildBuild, context } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { parse } from 'acorn';

function minifyWGSL(source) {
  let result = '';
  for (let i = 0; i < source.length;) {
    if (source.startsWith('//', i)) {
      const end = source.slice(i).search(/[\r\n]/);
      i = end < 0 ? source.length : i + end;
      result += ' ';
    } else if (source.startsWith('/*', i)) {
      let depth = 1;
      i += 2;
      while (depth && i < source.length) {
        if (source.startsWith('/*', i)) { depth++; i += 2; }
        else if (source.startsWith('*/', i)) { depth--; i += 2; }
        else i++;
      }
      if (depth) throw new Error('Unterminated WGSL block comment');
      result += ' ';
    } else {
      result += source[i++];
    }
  }
  return result.replace(/\s+/g, ' ').replace(/\s*([{}()[\],:;@])\s*/g, '$1');
}

const options = {
  entryPoints: ['src/index.js'],
  outfile: 'dist/leaflet-city-mapper.js',
  bundle: true,
  format: 'iife',
  minify: true,
  define: { 'import.meta': 'null' },
  sourcemap: true,
  plugins: [{
    name: 'minify-wgsl',
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, async ({ path }) => {
        let contents = await readFile(path, 'utf8');
        if (!contents.includes('/* wgsl */')) return { contents };
        const starts = new Set();
        const ast = parse(contents, {
          ecmaVersion: 'latest',
          sourceType: 'module',
          onComment(block, text, start, end) {
            if (block && text.trim() === 'wgsl') {
              starts.add(end + contents.slice(end).search(/\S/));
            }
          },
        });
        const edits = [];
        function visit(node) {
          if (!node || typeof node !== 'object') return;
          if (starts.has(node.start) && node.type === 'TemplateLiteral') {
            for (const part of node.quasis) {
              const text = minifyWGSL(part.value.cooked)
                .replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
              edits.push({ start: part.start, end: part.end, text });
            }
          }
          for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
          }
        }
        visit(ast);
        for (const edit of edits.sort((a, b) => b.start - a.start)) {
          contents = contents.slice(0, edit.start) + edit.text + contents.slice(edit.end);
        }
        return { contents };
      });
    },
  }],
};

const builds = [
  options,
  {
    ...options,
    outfile: 'dist/leaflet-city-mapper-src.js',
    minify: false,
    plugins: [],
  },
  {
    entryPoints: ['libs/openlayers-bindings.js'],
    outfile: 'libs/openlayers-bindings.min.js',
    minify: true,
    sourcemap: true,
  },
];

export async function build({ watch = false } = {}) {
  if (!watch) return Promise.all(builds.map(options => esbuildBuild(options)));
  const builders = await Promise.all(builds.map(options => context(options)));
  await Promise.all(builders.map(builder => builder.watch()));
  return () => Promise.all(builders.map(builder => builder.dispose()));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build();
}
