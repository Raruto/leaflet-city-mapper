# Build tooling

[Project README](../README.md) | [Source guide](../src/README.md) | [Test guide](../test/README.md)

## Build and development

```mermaid
flowchart LR
  Source["src/index.js"] --> Esbuild["esbuild + WGSL minification"]
  Worker["geometryWorker.js"] --> EsbuildWorker["esbuild worker"]
  Esbuild --> Dist["dist: minified + source bundles"]
  EsbuildWorker --> Dist
  Bindings["OpenLayers bindings"] --> Minify["Minified libs bundle"]
  Dev["npm run dev"] --> Watch["Watch builds"]
  Dev --> Server["Local server :8080"]
  Test["npm test"] --> Cache["Prepare browser dependencies"]
  Cache --> Build["Build bundles"]
  Build --> Cucumber["Leaflet 1 + 2 scenarios"]
```

[build.js](./build.js) also produces source maps; WGSL minification applies to
annotated shader templates in the minified main bundle.
[dev.js](./dev.js) watches builds and starts [server.js](./server.js), which
serves local files and byte ranges. See [test.js](./test.js) and the
[test guide](../test/README.md) for scenario selection and version differences.

## Data and releases

```mermaid
flowchart LR
  Data["External map data"] --> PMTiles["pmtiles.js"]
  PMTiles --> Archives["examples/data archives"]
  Version["npm version"] --> Prepare["version.js: update + stage references"]
  Prepare --> Rebuild["Build + stage"]
  Rebuild --> Publish["npm publish + git push"]
```

`npm run pmtiles` downloads and writes demo data; use `--only`, `--bbox`,
`--jobs` or `--out-dir` to constrain a run. `node build/pmtiles.js --self-test`
checks archive generation without rebuilding the demo data. The Colosseum
builder removes legacy TIFF assets after publishing the combined archive.

The npm version lifecycle can request authentication, stage files, publish and
push. Do not run it as a routine build or test. See [package.json](../package.json)
and [version.js](./version.js) for the exact commands.
