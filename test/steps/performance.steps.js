import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { Then } from '@cucumber/cucumber';
import { parse } from 'acorn';

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const ITERATORS = new Set(['forEach', 'map', 'filter', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap']);
const LOOPS = new Set(['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']);

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

function inspectLocalAllocations(node, depth, file, errors, exceptions) {
  if (!node || typeof node.type !== 'string') return;
  if (FUNCTIONS.has(node.type)) depth++;
  if (depth && ['ObjectExpression', 'ArrayExpression', 'NewExpression'].includes(node.type)) {
    const exception = exceptions.get(node.start);
    if (exception) exception.used = true;
    else errors.push(`${file}:${node.loc.start.line}:${node.loc.start.column + 1} local ${node.type}`);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectLocalAllocations(child, depth, file, errors, exceptions);
    } else if (value && typeof value.type === 'string') {
      inspectLocalAllocations(value, depth, file, errors, exceptions);
    }
  }
}

function localAllocationErrors(source, file) {
  const comments = [], errors = [], exceptions = new Map();
  const ast = parse(source, {
    ecmaVersion: 'latest', sourceType: 'module', locations: true, onComment: comments,
  });
  for (const comment of comments) {
    if (!comment.value.trim().startsWith('allocation:')) continue;
    if (comment.type !== 'Block' || !/^allocation: required -- \S[^\r\n]*\S$/.test(comment.value.trim())) {
      errors.push(`${file}:${comment.loc.start.line} invalid allocation exception; provide a block comment with a reason`);
      continue;
    }
    const next = source.slice(comment.end).search(/\S/);
    exceptions.set(comment.end + next, { comment, used: false });
  }
  inspectLocalAllocations(ast, 0, file, errors, exceptions);
  for (const { comment, used } of exceptions.values()) {
    if (!used) errors.push(`${file}:${comment.loc.start.line} unused allocation exception; place it immediately before one local allocation`);
  }
  return errors;
}

Then('local allocation checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    assert.equal(localAllocationErrors(source, 'example.js').length, Number(violations), source);
  }
});

Then('source functions allocate no object literals, array literals or constructed instances', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    errors.push(...localAllocationErrors(await readFile(file, 'utf8'), file));
  }
  assert.equal(errors.length, 0, `Local allocations are forbidden in source functions:\n${errors.join('\n')}`);
});

Then('local allocation checks accept source file {string}', async function (file) {
  assert.deepEqual(localAllocationErrors(await readFile(file, 'utf8'), file), []);
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
  inspectModuleVariables(ast, file.replaceAll('\\', '/').split('/'), exported, errors);
  return errors;
}

function inspectModuleVariables(node, path, exported, errors) {
  if (!node || typeof node.type !== 'string' || FUNCTIONS.has(node.type)) return;
  if (node.type === 'VariableDeclaration') {
    const file = path.join('/');
    if (file !== 'src/state.js' || node.kind !== 'const' || node.declarations.length !== 1 ||
        node.declarations[0].id.type !== 'Identifier' || node.declarations[0].id.name !== 'state' ||
        !exported.has('state')) {
      errors.push(`${file}:${node.loc.start.line} module variables must use the single exported const state in src/state.js`);
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

Then('module constants and state use the single state object', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const sourcePath = relative(process.cwd(), file).split(sep).join('/');
    errors.push(...moduleVariableErrors(await readFile(file, 'utf8'), sourcePath));
  }
  assert.deepEqual(errors, []);
  assert.ok(!(await readdir('src')).includes('constants'), 'src/constants must not be reintroduced');
  const module = await import('../../src/state.js');
  assert.deepEqual(Object.keys(module), ['state']);
  assert.equal(typeof module.state, 'object');
  assert.notEqual(module.state, null);
});

function isNestedSourceDirectory(directory) {
  return directory.replaceAll('\\', '/').split('/').filter(Boolean).length > 2;
}

Then('source directory checks handle these folders:', function (table) {
  for (const { directory, violations } of table.hashes()) {
    assert.equal(Number(isNestedSourceDirectory(directory)), Number(violations), directory);
  }
});

Then('source directories are direct children of src', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = relative(process.cwd(), `${entry.parentPath}/${entry.name}`).split(sep).join('/');
    if (isNestedSourceDirectory(directory)) {
      errors.push(`${directory}: nested source directory; move its contents to a direct child of src`);
    }
  }
  assert.deepEqual(errors, []);
});

function inspectLoopDeclarations(node, insideLoop, file, errors) {
  if (!node || typeof node.type !== 'string') return;
  insideLoop ||= LOOPS.has(node.type);
  if (insideLoop && node.type === 'VariableDeclaration') {
    errors.push(`${file}:${node.loc.start.line} loop ${node.kind} declaration; declare before the loop and assign inside it`);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectLoopDeclarations(child, insideLoop, file, errors);
    } else if (value && typeof value.type === 'string') {
      inspectLoopDeclarations(value, insideLoop, file, errors);
    }
  }
}

Then('loop declaration checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    const errors = [];
    inspectLoopDeclarations(parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true }),
      false, 'example.js', errors);
    assert.equal(errors.length, Number(violations), source);
  }
});

Then('source loops declare no variables in their headers or bodies', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    inspectLoopDeclarations(parse(await readFile(file, 'utf8'),
      { ecmaVersion: 'latest', sourceType: 'module', locations: true }), false, file, errors);
  }
  assert.equal(errors.length, 0, `${errors.length} declarations inside source loops:\n${errors.join('\n')}`);
});

Then('the PMTiles header decoder reuses one counter across its three loops', async function () {
  const ast = parse(await readFile('src/archives/decodeHeader.js', 'utf8'),
    { ecmaVersion: 'latest', sourceType: 'module' });
  const body = ast.body.find(node => node.type === 'ExportNamedDeclaration').declaration.body.body;
  const loops = body.filter(node => node.type === 'ForStatement');
  assert.equal(loops.length, 3, 'Sequential loops must not be wrapped in separate declaration blocks');
  const counters = new Set(loops.map(loop => loop.init.left.name));
  assert.equal(counters.size, 1, 'Sequential loops must share one counter');
  const names = body.filter(node => node.type === 'VariableDeclaration')
    .flatMap(node => node.declarations.flatMap(declaration => bindingNames(declaration.id)));
  assert.equal(names.filter(name => counters.has(name)).length, 1);
});

function inspectStandaloneBlocks(node, parent, file, errors) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'BlockStatement' &&
      ['Program', 'BlockStatement', 'SwitchCase', 'LabeledStatement'].includes(parent?.type)) {
    errors.push(`${file}:${node.loc.start.line} standalone scope; reuse local variables before sequential loops instead of wrapping them in blocks`);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectStandaloneBlocks(child, node, file, errors);
    } else if (value && typeof value.type === 'string') {
      inspectStandaloneBlocks(value, node, file, errors);
    }
  }
}

Then('standalone scope checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    const errors = [];
    inspectStandaloneBlocks(parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true }),
      null, 'example.js', errors);
    assert.equal(errors.length, Number(violations), source);
  }
});

Then('source files contain no standalone block scopes', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    inspectStandaloneBlocks(parse(await readFile(file, 'utf8'),
      { ecmaVersion: 'latest', sourceType: 'module', locations: true }), null, file, errors);
  }
  assert.equal(errors.length, 0, `${errors.length} standalone source scopes:\n${errors.join('\n')}`);
});
