import { spawnSync } from 'node:child_process';
import { build } from './build.js';
import { prepareDependencies } from '../test/fixtures/dependencies.js';

await prepareDependencies({ download: true });
await build();
const args = process.argv.slice(2);

for (const version of ['1', '2']) {
  const testArgs = [...args];
  // Node-only tests already ran with Leaflet 1; keep custom selections unchanged.
  if (version === '2' && args.length === 0) {
    testArgs.push('--tags', 'not @unit');
  }

  console.log(`\nRunning tests with Leaflet v${version}.x`);
  const result = spawnSync(process.execPath, [
    'node_modules/@cucumber/cucumber/bin/cucumber.js',
    ...testArgs,
  ], {
    env: { ...process.env, LEAFLET_VERSION: version },
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}
