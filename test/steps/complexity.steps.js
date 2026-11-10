import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { Then } from '@cucumber/cucumber';
import { parse } from 'acorn';

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const LOOPS = new Set(['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']);
const NESTING = new Set([...LOOPS, 'IfStatement', 'SwitchStatement', 'CatchClause']);
const LIMITS = { lines: 60, complexity: 15, nesting: 3 };

function children(node) {
  const result = [];
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) if (child && typeof child.type === 'string') result.push(child);
    } else if (value && typeof value.type === 'string') {
      result.push(value);
    }
  }
  return result;
}

function inspectFunction(node, tokens) {
  const metrics = { lines: 0, complexity: 1, nesting: 0, loops: 0 };
  const nested = [];
  function visit(current, depth, loops, parent) {
    if (current !== node && FUNCTIONS.has(current.type)) {
      nested.push(current);
      return;
    }
    if (current.type === 'IfStatement' || LOOPS.has(current.type) ||
      current.type === 'CatchClause' || current.type === 'ConditionalExpression' ||
      current.type === 'LogicalExpression' || current.type === 'AssignmentPattern' ||
      current.type === 'SwitchCase' && current.test ||
      current.type === 'AssignmentExpression' && ['&&=', '||=', '??='].includes(current.operator)) {
      metrics.complexity++;
    }
    // An else-if is another decision, but not another level of indentation.
    if (NESTING.has(current.type) && !(parent?.type === 'IfStatement' && parent.alternate === current)) depth++;
    if (LOOPS.has(current.type)) loops++;
    metrics.nesting = Math.max(metrics.nesting, depth);
    metrics.loops = Math.max(metrics.loops, loops);
    for (const child of children(current)) visit(child, depth, loops, current);
  }
  visit(node, 0, 0, null);
  const lines = new Set();
  for (const token of tokens) {
    if (token.start < node.start || token.end > node.end || token.type.label === 'template' ||
      token.type.label === 'eof' || nested.some(child => token.start >= child.start && token.end <= child.end)) continue;
    lines.add(token.loc.start.line);
  }
  metrics.lines = lines.size;
  return metrics;
}

function functionMetrics(source) {
  const tokens = [];
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, onToken: tokens });
  const results = [];
  function visit(node, parent) {
    if (FUNCTIONS.has(node.type)) {
      const name = node.id?.name || parent?.key?.name || parent?.key?.value ||
        (parent?.type === 'VariableDeclarator' ? parent.id.name : null) || '<anonymous>';
      results.push({ name, line: node.loc.start.line, ...inspectFunction(node, tokens) });
    }
    for (const child of children(node)) visit(child, node);
  }
  visit(ast, null);
  return results;
}

function violations(metrics) {
  return Object.entries(LIMITS).filter(([key, limit]) => metrics[key] > limit)
    .map(([key, limit]) => `${key} ${metrics[key]} > ${limit}`);
}

Then('complexity metrics distinguish decisions, nesting and independent functions', function () {
  const measure = source => functionMetrics(source)[0];
  assert.deepEqual(measure('function plain() { return 1; }'),
    { name: 'plain', line: 1, lines: 1, complexity: 1, nesting: 0, loops: 0 });
  const decisions = measure(`function decisions(a = 1) {
    if (a && a > 0) return a ? 1 : 0;
    else if (a ?? false) return 2;
    for (;;) { while (a) break; }
    try { run(); } catch (error) { a ||= 1; }
    switch (a) { case 1: break; default: break; }
  }`);
  assert.equal(decisions.complexity, 12);
  assert.equal(decisions.nesting, 2);
  assert.equal(decisions.loops, 2);
  assert.equal(measure('function chain(a) { if (a) run(); else if (a) run(); else if (a) run(); }').nesting, 1);
  const independent = functionMetrics(`function outer() {
    // A long comment is not executable code.

    function inner() { if (true) { while (true) break; } }
    return inner();
  }`);
  assert.equal(independent[0].complexity, 1);
  assert.equal(independent[0].nesting, 0);
  assert.equal(independent[0].lines, 3);
  assert.equal(independent[1].complexity, 3);
  assert.equal(measure('const arrow = () => true ? 1 : 0;').complexity, 2);
  assert.equal(measure('const object = { method() { return 1; } };').name, 'method');
  assert.equal(measure('function text() {\n const shader = `if (a) {\n while (b) {}\n}`;\n}').complexity, 1);
  assert.equal(measure('function text() {\n const shader = `first\nsecond\nthird`;\n}').lines, 4);
  assert.equal(measure('function text(a) { return `raw ${a ? 1 : 0}`; }').complexity, 2);
  for (const [key, limit] of Object.entries(LIMITS)) {
    assert.deepEqual(violations({ ...LIMITS, [key]: limit }), []);
    assert.equal(violations({ ...LIMITS, [key]: limit + 1 }).length, 1);
  }
  assert.equal(measure(`function sixty() {\n${'run();\n'.repeat(58)}}`).lines, 60);
  assert.equal(violations(measure(`function long() {\n${'run();\n'.repeat(59)}}`)).length, 1);
  assert.equal(violations(measure(`function branches(a) { ${'if (a) run(); '.repeat(14)} }`)).length, 0);
  assert.equal(violations(measure(`function branches(a) { ${'if (a) run(); '.repeat(15)} }`)).length, 1);
  assert.equal(violations(measure('function depth(a) { if (a) { for (;;) { while (a) break; } } }')).length, 0);
  assert.equal(violations(measure('function depth(a) { if (a) { for (;;) { while (a) { if (a) break; } } } }')).length, 1);
});

Then('production functions stay within strict complexity limits', { timeout: 30000 }, async function () {
  const failures = [];
  let functions = 0;
  const entries = await readdir('src', { recursive: true, withFileTypes: true });
  const files = entries.filter(entry => entry.isFile() && entry.name.endsWith('.js'))
    .map(entry => join(entry.parentPath, entry.name)).sort();
  for (const file of files) {
    for (const metrics of functionMetrics(await readFile(file, 'utf8'))) {
      functions++;
      const exceeded = violations(metrics);
      if (exceeded.length) failures.push(`${relative(process.cwd(), file)}:${metrics.line} ${metrics.name}: ${exceeded.join(', ')}; nested loops ${metrics.loops}`);
    }
  }
  assert.ok(functions > 0, 'No production functions were scanned');
  assert.equal(failures.length, 0,
    `Complexity limits exceeded in ${failures.length}/${functions} functions (no baseline exemptions):\n${failures.join('\n')}\n` +
    'Split responsibilities or simplify control flow. Nested loops are profiling candidates, not proof of slow execution.');
});
