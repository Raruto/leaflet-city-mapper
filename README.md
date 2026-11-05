# leaflet-city-mapper

[![NPM version](https://img.shields.io/npm/v/leaflet-city-mapper.svg?color=red)](https://www.npmjs.com/package/leaflet-city-mapper)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg?style=flat)](LICENSE)

**Your data, on a rotated and pitched Leaflet map:** a small 3D rendering engine (WebGPU) packaged onto standard `L.Layer`. Available sources: extruded GeoJSON, glTF models, raster PMTiles and terrain layers.

<p align="center">
    <a href="https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html"><img src="https://raruto.github.io/img/leaflet-city-mapper.png" alt="Leaflet 3D City Mapper" /></a>
</p>

_For a working example see one of the following demos:_

- [City of Paris in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html)
- [Ancient Rome in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-geojson.html)
- [Native Leaflet layers on WebGPU](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-native.html)

## How to use

Just load Leaflet before this plugin:


```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-city-mapper@0.0.3/dist/leaflet-city-mapper.js"></script>
```
And then create a native `L.Layer`:

```js
new L.Layer({ source: { /* source options */ } })
```
For example, here is how you can load a `geojson` object:

```js
const buildings = new L.Layer({
  source: {
    type: 'geojson',
    data: GeoJSON,
    style: ({ properties }) => ({ top: properties.height, color: properties.color }),
    tooltip: ({ properties }) => `${properties.name}: ${properties.height} m`,
  },
}).addTo(map);
```

### Time and walk controls

```js
const time = new L.Control.Time({ position: 'bottomright' });
new L.Control.Layers({}, { Shadows: time.layer.addTo(map) }).addTo(map);
const walk = new L.Control.Walk({ speed: 6, distance: 20 }).addTo(map);
```

Time stays under **Shadows** in the layers control; its checkbox enables/disables
the clock, sky and shadows together. Use `time.addTo(map)` instead for a standalone
control. `time.time` and `time.live` expose the selected UTC time and live mode.
Walk exposes `walk.walker` (`latlng`, `heading`, `phase`); W/S move, A/D turn,
drag looks around and Esc exits. Both controls support `remove()` and re-adding.
These replace the former `sunlight` and `walk` layer source types.

### Update demo data

The Paris example makes extensive use of [PMTiles](./build/pmtiles.js) to ensure offline access / long-term availability of the map. To update them:

```shell
npm run pmtiles
node build/pmtiles.js --only=trees
node build/pmtiles.js --jobs=6

```

All archives use the buildings bbox (default: `2.26,48.835,2.38,48.885`). Use `--bbox=west,south,east,north` to override it.

### Build Guide

Within your local development environment:

```shell
git clone git@github.com:Raruto/leaflet-city-mapper.git
cd ./leaflet-city-mapper

npm i         # install dependencies
npm run dev   # start dev server at: http://localhost:8080
npm run build # generate "dist" files (once)
npm run test  # build and run browser tests
```

After that you can start developing inside the `src` folder (eg. open "http://localhost:8080/examples" in your browser to preview changes).

The plugin integration tests compare native Leaflet prototypes and freshly constructed
instances (including source layers after initialization and native event dispatch) before and after loading the
bundle. Added methods or properties fail the check, including non-enumerable and symbol
keys, except for the source constructor's `initialize`, `Map.getPitch`,
`Map.getBearing` and `Marker.setRotation`. Overriding existing attributes is allowed.
The tests also reject a `CityMapper` global, public layer readiness/data methods,
and a public map reset method. Run the attribute check on both supported
Leaflet versions with `node build/test.js --name "The plugin does not add attributes"`.

The source-style tests also reject object literals, array literals and `new`
expressions inside every function in `src`, including default parameters and
returned values. Module-level initialization in `src/globals/` is allowed.
Source modules import the Leaflet namespace explicitly from `src/globals/L.js`;
only that binding reads `globalThis.L`, after Leaflet has loaded. An AST-based
test rejects implicit `L` references and direct global access elsewhere in `src`.
Invariant numeric factors, the fixed camera field of view, astronomical
obliquity and lamp ring directions are also precomputed in dedicated global
modules instead of recalculated per frame or vertex. Latitude-, zoom- and
camera-dependent calculations remain dynamic.
Necessary allocations require a separate comment immediately before the expression:
`/* allocation: required -- Each caller owns its result. */`.
The exception covers only that expression, not nested allocations or a whole
function; malformed and unused exceptions fail the check. Each exception must be
reviewed and covered by a behavior test (for example, independent archive headers).
Camera sky updates reuse a projection buffer owned by each time control.
`projectCelestialBody` and `mix` accept an optional final output buffer; omitting
it still returns an independent result. Atmosphere color stops live in their global module,
while returned tints remain independent.
Sun and Moon share date/location validation; lunar calculations do not build a
discarded solar result. Simulation events retain their own date snapshots.
Rendering and shadow passes reuse synchronous WebGPU descriptor scratch from
`src/globals/`; GPU-resource references are cleared after submission to the API.
Programs retain independent uniforms and vertex-buffer slot lists, with frozen
shared vertex-attribute layouts. Raster request queues and emitted event payloads
remain independent where listeners can reenter loading or retain a snapshot.
`shadowBounds(meshes, output)` optionally writes into caller-owned bounds;
omitting `output` and calling `shadowMatrix` still produce independent results.
Camera fitting uses scalar corner bounds; touch gestures and native marker
projection reuse scratch buffers owned by each gesture or layer. Options passed
to Leaflet view transitions remain independent because Leaflet mutates them.
This is a syntactic check, not allocation profiling: allocations hidden inside
function calls are not detected. Run it with
`node build/test.js --name "Local allocation checks|Source functions avoid explicit local allocations"`.
On Windows, browser setup and teardown allow extra time for the GPU process to
start or exit; scenario assertions and rendering thresholds are unchanged.
Set `TEST_BROWSER=msedge` to use installed Edge instead of bundled Chromium.
Leaflet 1.9 scripts, styles and marker images are served from the installed
Leaflet package during tests; Leaflet 2 still loads from the CDN.

### Source layout

```text
src/
  index.js           Public entry point and source registration
  globals/           One shared constant or mutable cell per module
  camera/            Camera API, projection and animation
  controls/          Compass, dragging, touch and resizing
  core/              Leaflet layer integration, events, mutations and overlays
  scene/             Source routing, lifecycle, graph nodes and transforms
  sources/           GeoJSON and streamed source geometry
  picking/           Raycasting, highlighting and feature interaction
  rendering/         Frame stages, roof atlases, pipelines, meshes and textures
  shadows/           Directional shadow maps, bounds and cache
  lighting/          Point lights and spatial light grids
  shaders/           Material shader generation
  geometry/          Trees, lights, bridges, primitives and Leaflet vector geometry
  triangulation/     Polygon triangulation and ring operations
  collision/         Mesh intersection and collision queries
  models/            glTF loading, decoding and materials
  archives/          PMTiles archive reading and decompression
  raster/            Raster tile loading, attachment and lifecycle
  traffic/           Routes, scheduling, simulation, loading and rendering
  vehicles/          Vehicle model geometry
  terrain/           Terrain loading and sampling
  sunlight/          Sun, moon, sky and time controls
  walk/              First-person walking
  utils/             Shared colour and numeric helpers
```

**Compatibile with:**
[![Leaflet 1.9.4 compatible!](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](http://leafletjs.com/reference.html) [![Leaflet 2.x compatible!](https://img.shields.io/badge/Leaflet-2.0.0--alpha.1-1EB300.svg?style=flat)](http://leafletjs.com/reference.html)