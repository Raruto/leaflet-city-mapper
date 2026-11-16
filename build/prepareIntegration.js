import { spawnSync } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function prepareIntegration() {
  let folder = process.env.LEAFLET_ELEVATION_FOLDER;
  if (!folder && process.env.CI) {
    folder = await mkdtemp(join(tmpdir(), 'city-mapper-elevation-'));
    for (const [command, args, options] of [
      ['git', ['clone', '--depth', '1', '--branch', 'master', 'https://github.com/Raruto/leaflet-elevation.git', folder], {}],
      [process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci'], { cwd: folder, shell: process.platform === 'win32' }],
      [process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: folder, shell: process.platform === 'win32' }],
    ]) {
      const result = spawnSync(command, args, { ...options, stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`Integration setup failed: ${command} ${args.join(' ')} (exit ${result.status})`);
    }
  }
  if (!folder) return;
  process.env.LEAFLET_ELEVATION_FOLDER = resolve(folder);
  process.env.LEAFLET_CITY_MAPPER_FOLDER ||= fileURLToPath(new URL('../dist/', import.meta.url));
  const { downloadAssets } = await import(pathToFileURL(join(resolve(folder), 'test', 'support', 'unpkg.js')).href);
  await downloadAssets();
}
