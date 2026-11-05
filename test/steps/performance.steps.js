import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
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
  if (node.type === 'ArrowFunctionExpression') {
    errors.push(`${file}:${lineOf(source, node.start)} arrow function; use a named function declaration`);
  }
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

Then('no source file defines arrows, nested functions or callback array methods', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const source = await readFile(file, 'utf8');
    visit(parse(source, { ecmaVersion: 'latest', sourceType: 'module' }), 0, file, source, errors);
  }
  assert.deepEqual(errors, []);
});

Then('source function checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    const errors = [];
    visit(parse(source, { ecmaVersion: 'latest', sourceType: 'module' }), 0, 'example.js', source, errors);
    assert.equal(errors.length, Number(violations), source);
  }
});

function bindingCount(pattern) {
  if (!pattern) return 0;
  switch (pattern.type) {
    case 'Identifier': return 1;
    case 'RestElement': return bindingCount(pattern.argument);
    case 'AssignmentPattern': return bindingCount(pattern.left);
    case 'ObjectPattern': {
      let count = 0;
      for (const property of pattern.properties) {
        count += bindingCount(property.type === 'RestElement' ? property.argument : property.value);
      }
      return count;
    }
    case 'ArrayPattern': {
      let count = 0;
      for (const element of pattern.elements) count += bindingCount(element);
      return count;
    }
    default: throw new Error(`Unsupported exported binding: ${pattern.type}`);
  }
}

function exportCount(source) {
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  let count = 0;
  for (const node of ast.body) {
    if (node.type === 'ExportDefaultDeclaration') count++;
    else if (node.type === 'ExportAllDeclaration') count += node.exported ? 1 : Infinity;
    else if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.type === 'VariableDeclaration') {
        for (const declaration of node.declaration.declarations) count += bindingCount(declaration.id);
      } else count += node.declaration ? 1 : node.specifiers.length;
    }
  }
  return count;
}

Then('source export counting handles these modules:', function (table) {
  for (const { source, count } of table.hashes()) {
    assert.equal(exportCount(source), Number(count), source);
  }
});

Then('each source file exports at most one binding', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const count = exportCount(await readFile(file, 'utf8'));
    if (count > 1) errors.push(`${file}: ${count === Infinity ? 'wildcard re-export' : `${count} exports`}; split into separate files`);
  }
  assert.deepEqual(errors, []);
});

function functionCount(node) {
  if (!node || typeof node.type !== 'string') return 0;
  let count = FUNCTIONS.has(node.type) ? 1 : 0;
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) count += functionCount(child);
    } else if (value && typeof value.type === 'string') count += functionCount(value);
  }
  return count;
}

Then('source function counting handles these modules:', function (table) {
  for (const { source, count } of table.hashes()) {
    assert.equal(functionCount(parse(source, { ecmaVersion: 'latest', sourceType: 'module' })), Number(count), source);
  }
});

Then('each source file defines at most one function', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const ast = parse(await readFile(file, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });
    const count = functionCount(ast);
    if (count > 1) errors.push(`${file}: ${count} functions; move additional functions to separate files`);
  }
  assert.deepEqual(errors, []);
});

function bindingNames(pattern, names = []) {
  if (!pattern) return names;
  switch (pattern.type) {
    case 'Identifier': names.push(pattern.name); break;
    case 'RestElement': bindingNames(pattern.argument, names); break;
    case 'AssignmentPattern': bindingNames(pattern.left, names); break;
    case 'ArrayPattern':
      for (const element of pattern.elements) bindingNames(element, names);
      break;
    case 'ObjectPattern':
      for (const property of pattern.properties) {
        bindingNames(property.type === 'RestElement' ? property.argument : property.value, names);
      }
      break;
    default: throw new Error(`Unsupported module binding: ${pattern.type}`);
  }
  return names;
}

function moduleVariableErrors(source, file) {
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const exported = new Set();
  for (const node of ast.body) {
    if (node.type !== 'ExportNamedDeclaration' || node.source) continue;
    for (const specifier of node.specifiers) exported.add(specifier.local.name);
    if (node.declaration?.type === 'VariableDeclaration') {
      for (const declaration of node.declaration.declarations) {
        for (const name of bindingNames(declaration.id)) exported.add(name);
      }
    }
  }
  const errors = [];
  inspectModuleVariables(ast, file.split('/'), exported, errors);
  return errors;
}

function inspectModuleVariables(node, path, exported, errors) {
  if (!node || typeof node.type !== 'string' || FUNCTIONS.has(node.type)) return;
  if (node.type === 'VariableDeclaration') {
    const folder = node.kind === 'const' ? 'constants' : node.kind === 'let' ? 'state' : null;
    const file = path.join('/');
    if (!folder || !path.slice(0, -1).includes(folder)) {
      errors.push(`${file}:${node.loc.start.line} module ${node.kind}; move to ${folder || 'constants or state'}`);
    } else {
      for (const declaration of node.declarations) {
        for (const name of bindingNames(declaration.id)) {
          if (!exported.has(name)) errors.push(`${file}:${node.loc.start.line} module binding ${name} must be exported`);
        }
      }
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectModuleVariables(child, path, exported, errors);
    } else if (value && typeof value.type === 'string') inspectModuleVariables(value, path, exported, errors);
  }
}

Then('module variable checks handle these files:', function (table) {
  for (const { file, source, violations } of table.hashes()) {
    assert.equal(moduleVariableErrors(source, file).length, Number(violations), `${file}: ${source}`);
  }
});

Then('module constants and state are exported from their dedicated folders', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const sourcePath = relative(process.cwd(), file).split(sep).join('/');
    errors.push(...moduleVariableErrors(await readFile(file, 'utf8'), sourcePath));
  }
  assert.deepEqual(errors, []);
});
