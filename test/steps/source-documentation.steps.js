import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { Then } from '@cucumber/cucumber';

function isReadmeForbidden(path) {
  return ['.github', 'examples'].some(root => path === root || path.startsWith(`${root}${sep}`));
}

async function readmeIssues(directory) {
  const missing = [], forbidden = [];
  let pending = ['.'];
  while (pending.length) {
    const children = [];
    for (const current of pending) {
      const entries = await readdir(join(directory, current), { withFileTypes: true });
      const hasReadme = entries.some(entry => entry.name === 'README.md' && entry.isFile());
      if (isReadmeForbidden(current)) {
        if (hasReadme) forbidden.push(current);
      } else if (!hasReadme) missing.push(current);
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== '.git') children.push(join(current, entry.name));
      }
    }
    if (!children.length) break;
    const paths = children.map(path => `${path.replace(/\\/g, '/')}/`);
    const result = spawnSync('git', ['check-ignore', '--no-index', '-z', '--stdin'], {
      cwd: directory, input: `${paths.join('\0')}\0`, encoding: 'utf8',
    });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(`git check-ignore failed: ${result.stderr}`);
    }
    const ignored = new Set(result.stdout.split('\0'));
    pending = children.filter((path, index) =>
      isReadmeForbidden(path) || !ignored.has(paths[index]));
  }
  return { missing: missing.sort(), forbidden: forbidden.sort() };
}

Then('repository README requirements are satisfied', async function () {
  assert.deepEqual(await readmeIssues('.'), { missing: [], forbidden: [] }, 'Invalid README.md locations');
});

Then('README checks respect Git ignore rules and excluded directories', async function () {
  const root = await mkdtemp(join(tmpdir(), 'city-mapper-readmes-'));
  const child = join(root, 'child'), nested = join(child, 'nested');
  try {
    const init = spawnSync('git', ['init', '-q'], { cwd: root, encoding: 'utf8' });
    if (init.error) throw init.error;
    if (init.status !== 0) throw new Error(`git init failed: ${init.stderr}`);
    await mkdir(nested, { recursive: true });
    await mkdir(join(root, 'ignored', 'nested'), { recursive: true });
    await mkdir(join(root, 'kept.tmp'));
    await mkdir(join(root, 'ignored.tmp'));
    await mkdir(join(child, 'ignored cache'));
    await mkdir(join(root, '.notes'));
    await mkdir(join(root, '.github', 'workflows'), { recursive: true });
    await mkdir(join(root, '.github', 'ignored'));
    await mkdir(join(root, 'examples', 'data', 'ignored'), { recursive: true });
    await writeFile(join(root, '.gitignore'), 'ignored/\n*.tmp/\n!kept.tmp/\n');
    await writeFile(join(child, '.gitignore'), 'ignored cache/\n');
    await writeFile(join(child, 'README.md'), '');
    assert.deepEqual(await readmeIssues(root), {
      missing: ['.', '.notes', join('child', 'nested'), 'kept.tmp'].sort(),
      forbidden: [],
    });
    await writeFile(join(root, 'README.md'), '');
    await writeFile(join(nested, 'README.md'), '');
    await writeFile(join(root, 'kept.tmp', 'README.md'), '');
    await writeFile(join(root, '.notes', 'README.md'), '');
    await writeFile(join(root, '.github', 'README.md'), '');
    await writeFile(join(root, '.github', 'workflows', 'README.md'), '');
    await writeFile(join(root, '.github', 'ignored', 'README.md'), '');
    await writeFile(join(root, 'examples', 'README.md'), '');
    await writeFile(join(root, 'examples', 'data', 'README.md'), '');
    await writeFile(join(root, 'examples', 'data', 'ignored', 'README.md'), '');
    assert.deepEqual(await readmeIssues(root), {
      missing: [],
      forbidden: [
        '.github', join('.github', 'ignored'), join('.github', 'workflows'),
        'examples', join('examples', 'data'), join('examples', 'data', 'ignored'),
      ].sort(),
    });
    await rm(join(root, '.github', 'README.md'));
    await rm(join(root, '.github', 'workflows', 'README.md'));
    await rm(join(root, '.github', 'ignored', 'README.md'));
    await rm(join(root, 'examples', 'README.md'));
    await rm(join(root, 'examples', 'data', 'README.md'));
    await rm(join(root, 'examples', 'data', 'ignored', 'README.md'));
    assert.deepEqual(await readmeIssues(root), { missing: [], forbidden: [] });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
