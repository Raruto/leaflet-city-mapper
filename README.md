# leaflet-city-mapper

WebGPU city scenes for **leaflet-rotate**: glTF/GLB models, PMTiles buildings,
trees and streetlights, terrain, solar lighting, traffic and a walking camera.
No Three.js, OGL or import map is required.

Extracted from Raruto/leaflet-rotate at `c7fef65`. The original GPL-3.0 license
and source authorship are retained; this repository starts a new Git history.
Bearing, pitch, Leaflet overlays, navigation constraints and their regression
tests remain in leaflet-rotate.

## Local development

Examples and browser tests load the precompiled leaflet-rotate 0.5.2 release
from unpkg. No sibling checkout or compilation of leaflet-rotate is required:

```shell
npm install
npm run build
npm run dev
```

Open <http://127.0.0.1:8080/examples/paris.html>. WebGPU requires a compatible
browser/GPU and a secure context (HTTPS or localhost). Internet access is needed
to load the precompiled Leaflet and leaflet-rotate scripts.

## Usage

Load precompiled Leaflet and leaflet-rotate, then this plugin:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-rotate@0.5.2/dist/leaflet-rotate-src.js"></script>
<script src="dist/leaflet-city-mapper.js"></script>
```

For Leaflet 2.0.0-alpha.1, use `leaflet-global-src.js` and set
`globalThis.L = globalThis.leaflet` before loading the plugins.

```js
const map = new L.Map('map', {
  center: [48.85826, 2.2945], zoom: 17, rotate: true, bearing: 30, pitch: 45,
});
const model = new L.Layer({
  source: {
    type: '3d',
    url: './examples/data/eiffel-tower.glb',
    center: [48.85826, 2.2945],
  },
}).addTo(map);
model.on('error', ({ error }) => console.error(error));
await model.ready;
```

`source.type` supports `3d`, `pmtiles`, `terrain`, `sunlight`, `traffic` and
`walk`. Without a type, `.pmtiles` URLs select a raster archive; other sources
select `3d`. The router and type modules load on demand from `dist/3d/`, so
deploy that directory alongside the main script. Type-specific methods become
available after `layer.ready` resolves. Leaflet subclasses are not rerouted.

Generic rendering code lives in `src/3d/`; Paris-specific loaders, routes and
datasets live in `misc/` and are referenced through the example's `source` options.

## Paris data

`examples/paris.html` uses local archives in `examples/data/`. Existing archives
were moved from the sibling checkout; these large generated files are ignored
by Git. Recreate them with:

```shell
npm run pmtiles
node build/pmtiles.js --only=trees
```

The builder downloads public IGN and Ville de Paris datasets. Dataset and
Eiffel Tower model credits are preserved in the example's layer attributions;
data retain their original licenses, independently of this project's code.
The Paris traffic example can request live public traffic data.

## Tests

```shell
npm test
node build/test.js --tags=@unit
node build/test.js "--tags=not @offline"
```

Tests run against Leaflet 1.9 and 2.0.0-alpha.1. Install Playwright's browser
with `npx playwright install chromium` if it is missing. `TEST_BROWSER=chrome`,
`msedge` or `firefox` selects an installed alternative. Browser 3D tests require
a WebGPU adapter and fail explicitly if none is available; `@unit` tests do not.
`@offline` tests additionally require the generated Paris archives.
Non-offline archive scenarios use deterministic mocked tiles.

Some inherited browser scenarios still assert the former WebGL renderer's
`renderer.gl` API and need porting to WebGPU. They are retained, not silently
skipped; a full run currently reports these legacy failures. The `@webgpu`
scenarios exercise the current renderer directly.
With the transferred archives, the terrain-grid check also reports about
10.61 m maximum error against its 0.01 m threshold, and the offline example
occasionally exceeds its startup timeout. Extraction does not change rendering
algorithms or loosen these checks.

The four generic raster/pitch regression scenarios were moved back to
leaflet-rotate's `test/features/pitch.feature`, with no 3D module or GPU setup.
Navigation bounds tests also remain there and use a standalone fixture.

## License

[GPL-3.0](LICENSE), inherited from leaflet-rotate.
