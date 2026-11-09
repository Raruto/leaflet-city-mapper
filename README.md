# leaflet-city-mapper

[![NPM version](https://img.shields.io/npm/v/leaflet-city-mapper.svg?color=red)](https://www.npmjs.com/package/leaflet-city-mapper)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg?style=flat)](LICENSE)

**Your data, on a rotated and pitched Leaflet map:** a small 3D rendering engine (WebGPU) packaged onto standard `L.Layer`. Available sources: extruded GeoJSON, glTF models, raster PMTiles, COG, MVT/PBF and terrain layers.

<p align="center">
    <a href="https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html"><img src="https://raruto.github.io/img/leaflet-city-mapper.png" alt="Leaflet 3D City Mapper" /></a>
</p>

_For a working example see one of the following demos:_

- [City of Paris in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html)
- [Ancient Rome in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-rome.html)
- [Matterhorn in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-matterhorn.html)
- [Native Leaflet layers on WebGPU](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-native.html)
- [Vector tiles](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-vector-tiles.html)

## How to use

Just load Leaflet before this plugin:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-city-mapper@0.0.6/dist/leaflet-city-mapper.js"></script>
```

And then create a native `L.Layer`:

```js
new L.Layer({ source: { /* source options */ } })
```
For example, here is how you can load a `geojson` object:

```js
const buildings = new L.Layer({
  source: {
    type: 'vector',
    data: GeoJSON,
    style: ({ properties }) => ({ top: properties.height, color: properties.color }),
    tooltip: ({ properties }) => `${properties.name}: ${properties.height} m`,
    roofTexture: true,
    wallTexture: 0.75,
  },
}).addTo(map);
```

### Source workers

The shared dedicated Web Worker prepares GeoJSON geometry, COG tiles and
glTF/GLB models. TIFF parsing, decompression, pixel conversion, glTF accessor
decoding, normal generation and image decoding run off the main thread.
Vertex/elevation buffers and decoded images are transferred to it; Leaflet
callbacks, feature properties, GPU uploads and scene ownership stay on the
main thread. Rendering already uses WebGPU.

Keep `dist/leaflet-city-mapper-worker.js` beside the main bundle when
self-hosting, or configure `source.workerUrl` (also supported by terrain
sources). Custom workers must implement the shared geometry, vector, COG and
model tasks. Cross-origin workers require CORS and CSP permission for `blob:`
workers. Workers are pooled per map, reused across source tasks and terminated
on map unload or task cancellation/failure. Each worker caches one COG archive
at a time; switching archives rereads its directory.

Web Workers are required, including for small GeoJSON blocks.
`source.worker: false` emits a layer `error` instead of enabling main-thread
geometry. No Service Worker or offline cache is registered.

Moving source preparation reduces the main bundle, not the combined download
by the same amount: the worker contains these readers and decoders.

### Time and walk controls

The walk camera follows vertical ascent and descent as well as horizontal
movement. Releasing Space lets the walker land on loaded building roofs;
walking off an edge resumes falling toward the terrain or the next roof below.

```js
const time = new L.Control.Time({ position: 'bottomright' }).layer.addTo(map);
const walk = new L.Control.Walk({ speed: 6, distance: 20 }).addTo(map);
```

### Update demo data

The examples makes extensive use of [PMTiles](./build/pmtiles.js) to ensure offline access / long-term availability of the maps. To update them:

```shell
npm run pmtiles
node build/pmtiles.js --only=trees
node build/pmtiles.js --only=colosseum
node build/pmtiles.js --jobs=6
node build/pmtiles.js --self-test
```

Paris archives use the buildings bbox (default: `2.26,48.835,2.38,48.885`). Use `--bbox=west,south,east,north` to override it.

### Build Guide

Within your local development environment:

```shell
git clone git@github.com:Raruto/leaflet-city-mapper.git
cd ./leaflet-city-mapper

npm i         # install dependencies
npm run dev   # start dev server at: http://localhost:8080
npm run build # generate "dist" bundles and minified "libs" files (once)
npm run test  # build and run browser tests
```

After that you can start developing inside the `src` folder (eg. open "http://localhost:8080/examples" in your browser to preview changes).

### Source layout

```text
src/
  index.js           Public entry point and source registration
  globals/           One shared constant or mutable cell per module
  weakmaps/          One private WeakMap per map/layer state field
  mvt/               PBF vector tile decoding and tessellation
  vector-style/      Safe vector style parsing and expressions
  vector-tiles/      Native vector tile lifecycle and worker preparation
  camera/            Leaflet camera API and scene camera state
  controls/          Compass, dragging, touch and resizing
  core/              Leaflet hooks, camera-aware overlays and readiness
  native/            Native Leaflet layers rendered through WebGPU
  layer-controls/    Layer entry placement and progress indicators
  scene/             Source routing, lifecycle and graph nodes
  sources/           GeoJSON and streamed source loading and assembly
  workers/           Geometry, MVT, COG and model tasks sharing one CDN-compatible worker
  picking/           Raycasting, highlighting and feature interaction
  rendering/         Frame stages, draw pipelines and mesh lifecycle
  gpu/               Device initialization, renderer resources and diagnostics
  materials/         Material programs, uniforms, glTF materials and cutouts
  textures/          Image loading, texture upload/binding and roof atlases
  animations/        Camera transitions, zoom synchronization and tile fading
  shadows/           Directional shadow maps and cache
  lighting/          Point lights and spatial light grids
  shaders/           Material shader generation
  geometry/          Mesh construction, bounds, grids, vectors and route geometry
  projections/       Map, screen and local coordinate conversion
  transforms/        Local/world matrices and glTF node transforms
  triangulation/     Polygon triangulation and ring operations
  collision/         Mesh intersection and collision queries
  models/            glTF loading, decoding and scene assembly
  archives/          PMTiles archive reading and decompression
  cog/               Supported GeoTIFF directories, byte ranges and tile decoding
  raster/            Raster tile loading, attachment and lifecycle
  traffic/           Routes, scheduling, simulation, loading and rendering
  vehicles/          Vehicle model geometry
  terrain/           Terrain loading and sampling
  astronomy/         Sun/moon position and observer/date validation
  sunlight/          Sky, celestial display and time controls
  walk/              First-person walking
  colors/            Colour parsing, conversion, interpolation and formatting
  utils/             Shared numeric and no-op helpers
```

**Compatibile with:**
[![Leaflet 1.9.4 compatible!](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](http://leafletjs.com/reference.html) [![Leaflet 2.x compatible!](https://img.shields.io/badge/Leaflet-2.0.0--alpha.1-1EB300.svg?style=flat)](http://leafletjs.com/reference.html)