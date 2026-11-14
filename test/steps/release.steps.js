import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Then } from '@cucumber/cucumber';

Then('npm version fails without changing the package unless scripts are explicitly disabled', async function () {
  const root = await mkdtemp(join(tmpdir(), 'city-mapper-version-'));
  try {
    const files = ['package.json', 'package-lock.json'];
    const originals = [];
    for (const file of files) {
      await copyFile(new URL(`../../${file}`, import.meta.url), join(root, file));
      originals.push(await readFile(join(root, file), 'utf8'));
    }
    const options = {
      cwd: root,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      env: { ...process.env, npm_config_ignore_scripts: 'false' },
    };
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const blocked = spawnSync(npm, ['version', 'patch', '--no-git-tag-version'], options);
    if (blocked.error) throw blocked.error;
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stdout + blocked.stderr, /Versioning is handled by GitHub Actions/);
    for (const [index, file] of files.entries()) {
      assert.equal(await readFile(join(root, file), 'utf8'), originals[index]);
    }
    const allowed = spawnSync(npm, ['version', 'patch', '--no-git-tag-version', '--ignore-scripts'], options);
    if (allowed.error) throw allowed.error;
    assert.equal(allowed.status, 0, allowed.stderr);
    const previous = JSON.parse(originals[0]).version.split('.').map(Number);
    previous[2]++;
    assert.equal(JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version, previous.join('.'));
    assert.equal(JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8')).version, previous.join('.'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

Then('CD rejects failed runs, pull requests, other branches and forks', async function () {
  const workflow = await readFile(new URL('../../.github/workflows/cd.yml', import.meta.url), 'utf8');
  const condition = workflow.match(/    if: >-\r?\n((?:      .*\r?\n)+)/);
  assert.ok(condition, 'CD must define a release condition');
  const eligible = new Function('github', `return (${condition[1]});`);
  const run = {
    conclusion: 'success',
    event: 'push',
    head_branch: 'master',
    head_repository: { full_name: 'Raruto/leaflet-city-mapper' },
  };
  const github = { repository: run.head_repository.full_name, event: { workflow_run: run } };
  assert.equal(eligible(github), true);
  for (const change of [
    { conclusion: 'failure' },
    { event: 'pull_request' },
    { head_branch: 'feature' },
    { head_repository: { full_name: 'other/leaflet-city-mapper' } },
  ]) {
    assert.equal(eligible({ ...github, event: { workflow_run: { ...run, ...change } } }), false);
  }
  assert.ok(workflow.includes('head-sha: ${{ github.event.workflow_run.head_sha }}'));
});
