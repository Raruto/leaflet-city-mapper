import assert from 'node:assert/strict';
import childProcess, { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Then } from '@cucumber/cucumber';
import { prepareIntegration } from '../../build/prepareIntegration.js';

Then('integration preparation builds elevation once and propagates setup failures', async function () {
  const keys = ['CI', 'LEAFLET_ELEVATION_FOLDER', 'LEAFLET_CITY_MAPPER_FOLDER', 'INTEGRATION_CACHE_READY'];
  const saved = new Map(keys.map(key => [key, process.env[key]]));
  const spawn = childProcess.spawnSync, folders = [], calls = [];
  let failed = false;
  childProcess.spawnSync = (command, args, options) => {
    calls.push({ command, args, options });
    if (command === 'git') {
      const folder = args.at(-1);
      folders.push(folder);
      mkdirSync(join(folder, 'test', 'support'), { recursive: true });
      writeFileSync(join(folder, 'package.json'), '{"type":"module"}');
      writeFileSync(join(folder, 'test', 'support', 'unpkg.js'),
        'export async function downloadAssets() { if (!process.env.LEAFLET_CITY_MAPPER_FOLDER) throw new Error("Missing local city mapper"); process.env.INTEGRATION_CACHE_READY = "true"; }');
    }
    return { status: failed ? 1 : 0 };
  };
  syncBuiltinESMExports();
  try {
    for (const key of keys) delete process.env[key];
    await prepareIntegration();
    assert.equal(calls.length, 0);
    process.env.CI = 'true';
    await prepareIntegration();
    assert.equal(calls.length, 3);
    assert.deepEqual(calls[0].args.slice(0, -1), [
      'clone', '--depth', '1', '--branch', 'master', 'https://github.com/Raruto/leaflet-elevation.git',
    ]);
    assert.deepEqual(calls.slice(1).map(call => call.args), [['ci'], ['run', 'build']]);
    assert.ok(calls.slice(1).every(call => call.options.cwd === folders[0]));
    assert.equal(process.env.LEAFLET_ELEVATION_FOLDER, folders[0]);
    assert.equal(process.env.INTEGRATION_CACHE_READY, 'true');
    await prepareIntegration();
    assert.equal(calls.length, 3, 'Explicit checkouts must not be cloned or rebuilt');
    delete process.env.LEAFLET_ELEVATION_FOLDER;
    failed = true;
    await assert.rejects(prepareIntegration(), /Integration setup failed: git/);
    assert.equal(process.env.LEAFLET_ELEVATION_FOLDER, undefined);
  } finally {
    childProcess.spawnSync = spawn;
    syncBuiltinESMExports();
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    for (const folder of folders) await rm(folder, { recursive: true, force: true });
  }
});

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
