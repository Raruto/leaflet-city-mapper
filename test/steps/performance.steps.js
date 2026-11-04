import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { Then } from '@cucumber/cucumber';
import { parse } from 'acorn';

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const ITERATORS = new Set(['forEach', 'map', 'filter', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap']);

function lineOf(source, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) if (source.charCodeAt(i) === 10) line++;
  return line;
}

function visit(node, depth, file, source, errors) {
  if (!node || typeof node.type !== 'string') return;
  if (FUNCTIONS.has(node.type)) {
    if (depth > 0) errors.push(`${file}:${lineOf(source, node.start)} nested ${node.type}`);
    depth++;
  }
  if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed && ITERATORS.has(node.callee.property.name)) {
    errors.push(`${file}:${lineOf(source, node.start)} .${node.callee.property.name}()`);
  }
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) for (const child of value) visit(child, depth, file, source, errors);
    else if (value && typeof value.type === 'string') visit(value, depth, file, source, errors);
  }
}

Then('no source file defines functions inside functions or uses callback array methods', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const source = await readFile(file, 'utf8');
    visit(parse(source, { ecmaVersion: 'latest', sourceType: 'module' }), 0, file, source, errors);
  }
  assert.deepEqual(errors, []);
});
