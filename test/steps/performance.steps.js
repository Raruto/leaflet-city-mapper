import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { posix, relative, sep } from 'node:path';
import { Then } from '@cucumber/cucumber';
import { parse } from 'acorn';

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const ITERATORS = new Set(['forEach', 'map', 'filter', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap']);
const LOOPS = new Set(['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']);

function importLayoutErrors(source, file) {
  const comments = [], errors = [];
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, onComment: comments });
  let previous = null, last = null, seenOther = false;
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration') {
      seenOther = true;
      previous = null;
      continue;
    }
    if (seenOther) errors.push(`${file}:${node.loc.start.line} import follows another statement`);
    if (previous) {
      const lines = source.slice(previous.end, node.start).split(/\r\n|\r|\n/);
      if (lines.length < 2 || lines.slice(1, -1).some(line => !line.trim())) {
        errors.push(`${file}:${node.loc.start.line} imports must be on consecutive lines without blank lines`);
      }
    }
    previous = last = node;
  }
  if (last) {
    let end = last.end, endLine = last.loc.end.line;
    const following = [...comments, ...ast.body].filter(node => node.start >= last.end).sort((a, b) => a.start - b.start);
    for (const node of following) {
      if ((node.type === 'Line' || node.type === 'Block') && node.loc.start.line === endLine) {
        end = node.end;
        endLine = node.loc.end.line;
        continue;
      }
      if (!/^[ \t]*(?:\r\n|\r(?!\n)|\n)[ \t]*(?:\r\n|\r(?!\n)|\n)[ \t]*$/.test(source.slice(end, node.start))) {
        errors.push(`${file}:${last.loc.start.line} last import must be followed by one blank line`);
      }
      break;
    }
  }
  return errors;
}

Then('source import layout checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    const example = source.replaceAll('\\n', '\n');
    assert.equal(importLayoutErrors(example, 'example.js').length, Number(violations), source);
    assert.equal(importLayoutErrors(example.replaceAll('\n', '\r\n'), 'example.js').length, Number(violations), source);
  }
});

Then('source modules place imports together at the top', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    errors.push(...importLayoutErrors(await readFile(file, 'utf8'), file));
  }
  assert.deepEqual(errors, []);
});

function documentationErrors(source, file, requireTags = false, checkSpacing = false, onlySpacing = false) {
  const comments = [], errors = [], spacingErrors = [], exported = new Set(), documentedExports = new Map(), formatted = new Set();
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, onComment: comments });
  function isJSDoc(comment) {
    return comment.type === 'Block' && comment.value.startsWith('*') && /[^\s*]/.test(comment.value.slice(1));
  }
  function documented(node) {
    for (let i = comments.length - 1; i >= 0; i--) {
      const comment = comments[i];
      if (comment.end > node.start) continue;
      return isJSDoc(comment) && /^\s*$/.test(source.slice(comment.end, node.start)) ? comment : null;
    }
    return false;
  }
  function checkFormat(doc) {
    if (checkSpacing && !formatted.has(doc.start)) {
      formatted.add(doc.start);
      spacingErrors.push(...jsdocSpacingErrors(doc, file));
    }
  }
  for (const node of ast.body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.type === 'VariableDeclaration') {
        for (const declaration of node.declaration.declarations) {
          for (const name of bindingNames(declaration.id)) exported.add(name);
        }
      } else if (!node.source) {
        for (const specifier of node.specifiers) {
          exported.add(specifier.local.name);
          if (documented(node)) documentedExports.set(specifier.local.name, documented(node));
        }
      }
    } else if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'Identifier') {
      exported.add(node.declaration.name);
      if (documented(node)) documentedExports.set(node.declaration.name, documented(node));
    } else if (node.type === 'ExportDefaultDeclaration' && !FUNCTIONS.has(node.declaration.type) &&
      node.declaration.type !== 'ClassDeclaration') {
      if (!documented(node)) errors.push(`${file}:${node.loc.start.line} default export lacks JSDoc`);
      else {
        const doc = documented(node);
        if (requireTags && !jsdocTags(doc).type.length) errors.push(`${file}:${node.loc.start.line} default export lacks @type`);
        checkFormat(doc);
      }
    }
  }
  function inspect(node, ancestors) {
    if (!node || typeof node.type !== 'string') return;
    const parent = ancestors.at(-1), grandparent = ancestors.at(-2);
    if (FUNCTIONS.has(node.type)) {
      let owner = node;
      if (parent?.type === 'ExportNamedDeclaration' || parent?.type === 'ExportDefaultDeclaration' ||
          parent?.type === 'MethodDefinition' || parent?.type === 'Property') owner = parent;
      else if (parent?.type === 'VariableDeclarator' && grandparent?.type === 'VariableDeclaration') {
        owner = ancestors.at(-3)?.type === 'ExportNamedDeclaration' ? ancestors.at(-3) : grandparent;
      }
      const doc = documented(owner) || documented(node);
      if (!doc) errors.push(`${file}:${node.loc.start.line} function lacks JSDoc`);
      else {
        if (requireTags) errors.push(...functionTagErrors(node, doc, file));
        checkFormat(doc);
        const target = documented(owner) === doc ? owner : node;
        if (checkSpacing && (source.slice(doc.end, target.start).match(/\r\n|\r|\n/g) || []).length > 1) {
          spacingErrors.push(`${file}:${node.loc.start.line} blank line between JSDoc and function`);
        }
      }
    }
    if (node.type === 'VariableDeclaration' && (parent?.type === 'Program' || parent?.type === 'ExportNamedDeclaration')) {
      const owner = parent.type === 'ExportNamedDeclaration' ? parent : node;
      for (const declaration of node.declarations) {
        for (const name of bindingNames(declaration.id)) {
          if (exported.has(name)) {
            const doc = documented(declaration) || documented(node) || documented(owner) || documentedExports.get(name);
            if (!doc) errors.push(`${file}:${declaration.loc.start.line} exported variable ${name} lacks JSDoc`);
            else {
              if (requireTags && !jsdocTags(doc).type.length) {
                errors.push(`${file}:${declaration.loc.start.line} exported variable ${name} lacks @type`);
              }
              checkFormat(doc);
            }
          }
        }
      }
    }
    ancestors.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) for (const child of value) inspect(child, ancestors);
      else if (value && typeof value.type === 'string') inspect(value, ancestors);
    }
    ancestors.pop();
  }
  inspect(ast, []);
  return onlySpacing ? spacingErrors : errors.concat(spacingErrors);
}

function jsdocSpacingErrors(comment, file) {
  const errors = [];
  let section = null, blankLines = 0;
  for (const raw of comment.value.split(/\r\n|\r|\n/)) {
    const line = raw.replace(/^\s*\* ?/, '').trim();
    if (!line) {
      if (section) blankLines++;
      continue;
    }
    const matches = [...line.matchAll(/(?<![\w$])@(param|returns?|throws|type)\b/g)];
    if (!section && (!matches.length || line.slice(0, matches[0].index).trim())) section = 'description';
    for (const match of matches) {
      const next = match[1] === 'return' ? 'returns' : match[1];
      if (section && section !== next && blankLines !== 1) {
        errors.push(`${file}:${comment.loc.start.line} JSDoc sections ${section} and ${next} need one blank line`);
      }
      section = next;
      blankLines = 0;
    }
    blankLines = 0;
  }
  return errors;
}

function jsdocTags(comment) {
  const tags = { param: [], returns: [], throws: [], type: [] };
  for (const match of comment.value.matchAll(/(?<![\w$])@(param|returns?|throws|type)\b[ \t]*([^@\r\n]*)/g)) {
    let value = match[2].trim().replace(/\s*\*$/, '').trim();
    if (!value) continue;
    if (value.startsWith('{')) {
      let depth = 0, end = -1;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === '{') depth++;
        if (value[i] === '}' && --depth === 0) { end = i; break; }
      }
      if (end < 2 || !value.slice(1, end).trim()) continue;
      if (match[1] === 'param') value = value.slice(end + 1).trim();
    } else if (match[1] === 'type') continue;
    tags[match[1] === 'return' ? 'returns' : match[1]].push(value);
  }
  return tags;
}

function functionTagErrors(node, doc, file) {
  const tags = jsdocTags(doc), errors = [], used = new Set(), names = [];
  for (const value of tags.param) {
    const match = /^(?:\[)?(?:\.\.\.)?([$\w]+)(?:=[^\]]*)?\]?($|[\s-])/.exec(value);
    names.push(match?.[1]);
  }
  for (const parameter of node.params) {
    const pattern = parameter.type === 'AssignmentPattern' ? parameter.left :
      parameter.type === 'RestElement' ? parameter.argument : parameter;
    if (pattern.type !== 'Identifier') continue;
    const index = names.indexOf(pattern.name);
    if (index < 0 || used.has(index)) errors.push(`${file}:${node.loc.start.line} parameter ${pattern.name} lacks @param`);
    else used.add(index);
  }
  for (const parameter of node.params) {
    const pattern = parameter.type === 'AssignmentPattern' ? parameter.left :
      parameter.type === 'RestElement' ? parameter.argument : parameter;
    if (pattern.type === 'Identifier') continue;
    const index = names.findIndex((name, i) => name && !used.has(i));
    if (index < 0) errors.push(`${file}:${node.loc.start.line} destructured parameter lacks @param`);
    else used.add(index);
  }
  let returns = node.async || node.generator || node.body.type !== 'BlockStatement', throws = 0;
  function inspectBody(child) {
    if (!child || typeof child.type !== 'string' || FUNCTIONS.has(child.type)) return;
    if (child.type === 'ReturnStatement' && child.argument) returns = true;
    if (child.type === 'ThrowStatement') throws++;
    for (const value of Object.values(child)) {
      if (Array.isArray(value)) for (const item of value) inspectBody(item);
      else if (value && typeof value.type === 'string') inspectBody(value);
    }
  }
  inspectBody(node.body);
  if (returns && !tags.returns.length) errors.push(`${file}:${node.loc.start.line} function lacks @returns`);
  if (throws > tags.throws.length) errors.push(`${file}:${node.loc.start.line} function has ${throws} throw(s) but ${tags.throws.length} @throws tag(s)`);
  return errors;
}

Then('source documentation checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    assert.equal(documentationErrors(source, 'example.js').length, Number(violations), source);
  }
});

Then('source documentation tag checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    assert.equal(documentationErrors(source, 'example.js', true).length, Number(violations), source);
  }
});

Then('source documentation spacing checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    const example = source.replaceAll('\\n', '\n');
    assert.equal(documentationErrors(example, 'example.js', false, true, true).length, Number(violations), source);
    assert.equal(documentationErrors(example.replaceAll('\n', '\r\n'), 'example.js', false, true, true).length, Number(violations), source);
  }
});

Then('documented source files follow JSDoc spacing rules', async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    errors.push(...documentationErrors(await readFile(file, 'utf8'), file, false, true, true));
  }
  assert.deepEqual(errors, []);
});

Then('JSDoc tag checks accept source directory {string}', async function (directory) {
  const errors = [];
  for (const entry of await readdir(directory, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    errors.push(...documentationErrors(await readFile(file, 'utf8'), file, true, true));
  }
  assert.deepEqual(errors, []);
});

Then('every source file documents its functions and exported variables with JSDoc', { timeout: 30000 }, async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    errors.push(...documentationErrors(await readFile(file, 'utf8'), file, true, true));
  }
  assert.equal(errors.length, 0, `Missing JSDoc:\n${errors.join('\n')}`);
});

function globalObject(node, aliases) {
  return node?.type === 'Identifier' && aliases.has(node.name) ||
    node?.type === 'MemberExpression' && globalObject(node.object, aliases) &&
    ['globalThis', 'window', 'self'].includes(memberKey(node));
}

function memberKey(node) {
  return node.computed ? node.property.type === 'Literal' ? node.property.value : undefined : node.property.name;
}

function inspectLeafletBindings(node, parent, imported, bridge, aliases, errors) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'ImportDeclaration') return;
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && globalObject(node.init, aliases)) {
    aliases.add(node.id.name);
  }
  if (node.type === 'MemberExpression' && memberKey(node) === 'L' && globalObject(node.object, aliases) && !bridge) {
    errors.set(node.property.start, `line ${node.loc.start.line}: global Leaflet access must use an import from src/globals/L.js`);
  }
  if ((node.type === 'VariableDeclarator' || node.type === 'AssignmentExpression') &&
      globalObject(node.init || node.right, aliases)) {
    const pattern = node.id || node.left;
    if (pattern.type === 'ObjectPattern' && !bridge) {
      for (const property of pattern.properties) {
        if (property.type === 'Property' && (property.key.name || property.key.value) === 'L') {
          errors.set(property.key.start, `line ${property.loc.start.line}: destructured global Leaflet must use src/globals/L.js`);
        }
      }
    }
  }
  if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'Reflect' && memberKey(node.callee) === 'get' &&
      globalObject(node.arguments[0], aliases) && node.arguments[1]?.value === 'L' && !bridge) {
    errors.set(node.start, `line ${node.loc.start.line}: reflected global Leaflet must use src/globals/L.js`);
  }
  if (!bridge) {
    const patterns = node.type === 'VariableDeclarator' ? [node.id] :
      FUNCTIONS.has(node.type) ? node.params : node.type === 'CatchClause' ? [node.param] : [];
    for (const pattern of patterns) {
      if (pattern?.type !== 'Identifier' && bindingNames(pattern).includes('L')) {
        errors.set(pattern.start, `line ${pattern.loc.start.line}: local bindings cannot shadow the Leaflet import`);
      }
    }
  }
  if (node.type === 'Identifier' && node.name === 'L') {
    const property = parent?.type === 'MemberExpression' && parent.property === node && !parent.computed ||
      ['Property', 'MethodDefinition', 'PropertyDefinition'].includes(parent?.type) &&
        parent.key === node && !parent.computed && !parent.shorthand;
    const declaration = parent?.type === 'VariableDeclarator' && parent.id === node ||
      FUNCTIONS.has(parent?.type) && (parent.id === node || parent.params.includes(node)) ||
      parent?.type === 'CatchClause' && parent.param === node ||
      ['ClassDeclaration', 'ClassExpression'].includes(parent?.type) && parent.id === node;
    if (!property && !bridge && (!imported || declaration)) {
      errors.set(node.start, `line ${node.loc.start.line}: L must be imported from src/globals/L.js, not global or locally redefined`);
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectLeafletBindings(child, node, imported, bridge, aliases, errors);
    } else if (value && typeof value.type === 'string') {
      inspectLeafletBindings(value, node, imported, bridge, aliases, errors);
    }
  }
}

function leafletBindingErrors(source, file) {
  file = file.replaceAll('\\', '/');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  let imported = false;
  const errors = new Map(), aliases = new Set(['globalThis', 'window', 'self']);
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration') continue;
    for (const specifier of node.specifiers) {
      if (specifier.local.name !== 'L') continue;
      if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'L' &&
          posix.normalize(posix.join(posix.dirname(file), node.source.value)) === 'src/globals/L.js') {
        imported = true;
      } else {
        errors.set(specifier.start, `line ${specifier.loc.start.line}: L must come from the dedicated Leaflet binding`);
      }
    }
  }
  inspectLeafletBindings(ast, null, imported, file === 'src/globals/L.js', aliases, errors);
  return [...errors.values()];
}

Then('Leaflet binding checks handle these modules:', function (table) {
  for (const { file, source, violations } of table.hashes()) {
    assert.equal(leafletBindingErrors(source, file).length, Number(violations), `${file}: ${source}`);
  }
});

Then('source modules access Leaflet only through its explicit global binding', { timeout: 30000 }, async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const sourcePath = relative(process.cwd(), file).split(sep).join('/');
    for (const error of leafletBindingErrors(await readFile(file, 'utf8'), sourcePath)) {
      errors.push(`${sourcePath}: ${error}`);
    }
  }
  assert.deepEqual(errors, []);
});

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

Then('no source file defines arrows, nested functions or callback array methods', { timeout: 30000 }, async function () {
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
    if (!/^alloc\b/.test(comment.value.trim()) && !comment.value.trim().startsWith('allocation:')) continue;
    if (comment.type !== 'Block' || comment.value.trim() !== 'alloc') {
      errors.push(`${file}:${comment.loc.start.line} invalid allocation exception; use /* alloc */`);
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

Then('source functions allocate no object literals, array literals or constructed instances', { timeout: 30000 }, async function () {
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

Then('local allocation checks accept source directory {string}', async function (directory) {
  const errors = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${directory}/${entry.name}`;
    errors.push(...localAllocationErrors(await readFile(file, 'utf8'), file));
  }
  assert.deepEqual(errors, []);
});

Then('the PMTiles directory decoder uses a sized array and complete records', async function () {
  const ast = parse(await readFile('src/archives/decodeDirectory.js', 'utf8'),
    { ecmaVersion: 'latest', sourceType: 'module' });
  const body = ast.body.find(node => node.type === 'ExportNamedDeclaration').declaration.body.body;
  const statements = body.find(node => node.type === 'TryStatement').block.body;
  const entries = statements.filter(node => node.type === 'VariableDeclaration')
    .flatMap(node => node.declarations).find(node => node.id.name === 'entries');
  assert.equal(entries.init.type, 'NewExpression');
  assert.equal(entries.init.callee.name, 'Array');
  assert.equal(entries.init.arguments.length, 1);
  assert.equal(entries.init.arguments[0].name, 'count');
  const validation = statements.findIndex(node => node.type === 'IfStatement');
  assert.ok(validation >= 0, 'The directory count must be validated');
  assert.ok(validation < statements.findIndex(node => node.type === 'VariableDeclaration' &&
    node.declarations.includes(entries)), 'Validate the input count before allocating the directory');
  const loop = statements.find(node => node.type === 'ForStatement');
  const assignment = loop.body.body.find(node => node.type === 'ExpressionStatement' &&
    node.expression.type === 'AssignmentExpression' && node.expression.left.object?.name === 'entries');
  assert.ok(assignment, 'Write directly into a preallocated entry slot instead of growing the array');
  assert.equal(assignment.expression.left.computed, true);
  assert.equal(assignment.expression.left.property.name, loop.init.left.name);
  assert.equal(assignment.expression.right.type, 'ObjectExpression');
  assert.deepEqual(assignment.expression.right.properties.map(property => property.key.name),
    ['tileId', 'runLength', 'length', 'offset']);
});

function inspectSizedArrays(node, file, errors) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'ArrayExpression' && !node.elements.length ||
      ['NewExpression', 'CallExpression'].includes(node.type) && node.callee.name === 'Array' &&
      node.arguments.length !== 1 ||
      node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
      ['push', 'unshift', 'splice'].includes(memberKey(node.callee))) {
    errors.push(`${file}:${node.loc.start.line} use an explicitly sized array and indexed writes`);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectSizedArrays(child, file, errors);
    } else if (value && typeof value.type === 'string') inspectSizedArrays(value, file, errors);
  }
}

Then('source file {string} avoids unsized arrays and array growth methods', async function (file) {
  const errors = [];
  inspectSizedArrays(parse(await readFile(file, 'utf8'),
    { ecmaVersion: 'latest', sourceType: 'module', locations: true }), file, errors);
  assert.deepEqual(errors, []);
});

Then('sized array checks handle these modules:', function (table) {
  for (const { source, violations } of table.hashes()) {
    const errors = [];
    inspectSizedArrays(parse(source,
      { ecmaVersion: 'latest', sourceType: 'module', locations: true }), 'example.js', errors);
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

Then('each source file exports at most one binding', { timeout: 30000 }, async function () {
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

Then('each source file defines at most one function', { timeout: 30000 }, async function () {
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
    const name = path.at(-1).replace(/\.js$/, '');
    if (path.length !== 3 || path[0] !== 'src' || !['globals', 'weakmaps'].includes(path[1]) ||
        node.kind !== 'const' || node.declarations.length !== 1 ||
        node.declarations[0].id.type !== 'Identifier' || node.declarations[0].id.name !== name ||
        !exported.has(name)) {
      errors.push(`${file}:${node.loc.start.line} module variables must be a single exported const matching their dedicated module filename`);
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

Then('module constants and state use dedicated global modules', { timeout: 30000 }, async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    const sourcePath = relative(process.cwd(), file).split(sep).join('/');
    errors.push(...moduleVariableErrors(await readFile(file, 'utf8'), sourcePath));
  }
  assert.deepEqual(errors, []);
  assert.ok(!(await readdir('src')).includes('constants'), 'src/constants must not be reintroduced');
  assert.ok(!(await readdir('src')).includes('state.js'), 'The shared state aggregator must not be reintroduced');
  for (const directory of ['globals', 'weakmaps']) {
    for (const file of await readdir(`src/${directory}`)) {
      const module = await import(`../../src/${directory}/${file}`);
      assert.deepEqual(Object.keys(module), [file.replace(/\.js$/, '')]);
    }
  }
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

Then('source loops declare no variables in their headers or bodies', { timeout: 30000 }, async function () {
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

Then('source files contain no standalone block scopes', { timeout: 30000 }, async function () {
  const errors = [];
  for (const entry of await readdir('src', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/');
    inspectStandaloneBlocks(parse(await readFile(file, 'utf8'),
      { ecmaVersion: 'latest', sourceType: 'module', locations: true }), null, file, errors);
  }
  assert.equal(errors.length, 0, `${errors.length} standalone source scopes:\n${errors.join('\n')}`);
});
