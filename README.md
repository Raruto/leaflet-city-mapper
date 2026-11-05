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

Load Leaflet (the only runtime dependency), then this plugin:


```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-city-mapper@0.0.2/dist/leaflet-city-mapper.js"></script>
```
And then set an approriate `source` param to layer constructor:

```js
new L.Layer({ source: .. })
```
For example, here you can use a `geojson` object, like this:

```js
const buildings = new L.Layer({
  source: {
    type: 'geojson',
    url: GeoJSON,
    style: ({ properties }) => ({ top: properties.height, color: properties.color }),
    tooltip: ({ properties }) => `${properties.name}: ${properties.height} m`,
  },
}).addTo(map);
```

The build produces a single self-contained [`dist/leaflet-city-mapper.js`](./dist/leaflet-city-mapper.js) bundle; Leaflet remains an external dependency. Vector/raster and feature initializers run on demand, while shared scene, rendering, geometry, glTF and PMTiles source lives in focused folders under `src/`.

Raster imagery blends coarse-to-fine on the terrain, retaining depth occlusion for 3D objects.

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

### Source layout

```text
src/
  index.js           Public entry point and source registration
  constants/         Exported module-level const bindings
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

### Optimization techniques

#### Rendering and GPU

| Technique | Implementation and scope |
| --- | --- |
| Shared renderer | Layers on the same map share a WebGPU device, canvas, scene and camera ([attachment](src/scene/attach.js)). |
| On-demand frames | Updates are coalesced through `requestAnimationFrame`; static scenes do not continuously redraw. Animation and fading request subsequent frames ([scheduling](src/scene/update.js), [rendering](src/rendering/render.js)). |
| CPU frustum culling | World-space bounding spheres exclude off-screen meshes from the main pass. Loaded off-screen geometry can still cast shadows ([collection](src/rendering/collectMeshes.js)). |
| Depth-aware draw ordering | Ground tiles retain their layer/LOD ordering; opaque geometry is sorted front-to-back and transparent geometry back-to-front, subject to explicit render order ([sorting](src/rendering/compareMeshes.js)). |
| Batched source geometry | Features in a source block share vertex buffers and a mesh instead of one draw per feature ([source meshes](src/sources/attachAreaMesh.js)). |
| Conservative GPU instancing | Blocks whose features have identical geometry, normals and colors up to translation retain one template and a per-instance offset. Every reconstructed position must match the original `float32` value exactly; incompatible blocks and night-light sources keep the original batch. Main and shadow passes use instanced draws; feature picking and highlighting retain their ranges ([compaction](src/sources/instanceAreaGeometry.js)). |
| Reusable frame storage | Mesh lists, frustum planes and their lengths are reused per renderer, not as shared global scratch ([frame](src/rendering/render.js), [frustum](src/rendering/collectFrameMeshes.js)). |
| Direct direction transforms | Light and sky directions are multiplied by the camera view matrix without temporary `DOMPoint`/`DOMMatrix` objects ([uniforms](src/rendering/prepareFrameUniforms.js)). |
| Batched uniform upload | Camera and mesh uniforms use one growing buffer, dynamic offsets and one upload for the main/shadow frame ([uniform preparation](src/rendering/prepareFrameUniforms.js), [submission](src/rendering/render.js)). |
| Cached transforms and winding | Scene transforms update when local or parent state changes; front-face orientation is cached against the world-matrix version ([transforms](src/scene/updateWorldMatrix.js), [drawing](src/rendering/drawSceneMeshes.js)). |
| Cached pipelines, bindings and uploads | Render pipelines are cached by culling, winding and depth mode. Bind groups are reused until buffers/textures change; images and vertex data upload only when changed ([geometry drawing](src/rendering/drawGeometry.js)). |
| Cached directional shadows | Shadow maps are redrawn when light direction, mesh transforms, geometry, draw ranges or appearance change. Resolution is capped at 2048 and device limits ([shadows](src/shadows/renderSunlight.js)). |
| Cached bounds and roof coverage | Local geometry bounds and versioned world-space shadow bounds avoid repeated scans. Roof coverage is checked again when the raster signature changes ([bounds](src/geometry/computeBounds.js), [shadow bounds](src/shadows/shadowBounds.js), [roof visibility](src/rendering/prepareFrameMeshes.js)). |
| GPU roof atlas | Raster tiles are composited on the GPU; unchanged images are not reuploaded. Atlas signatures avoid redundant work, with a 50 ms rebuild throttle while tiles load ([atlas update](src/rendering/updateRoofRaster.js), [composition](src/rendering/composeRoofAtlas.js)). |
| Spatial light grids | Shaders query spatially grouped lights. Static and moving grids are cached separately; only changed grids are uploaded ([light updates](src/lighting/updatePointLights.js)). |
| GPU terrain sampling | Terrain materials sample elevation in the vertex shader. Model terrain conformation still runs on the CPU ([materials](src/shaders/materialShaders.js), [model conformation](src/geometry/conformModelToTerrain.js)). |
| GPU traffic placement | A compute shader updates vehicle geometry from lane and time data; CPU geometry is refreshed lazily for picking ([movement](src/traffic/moveTraffic.js), [picking preparation](src/traffic/placeTraffic.js)). |

Instancing currently compacts geometry **after CPU generation**. It reduces
retained vertex data and GPU uploads, but does not remove source-generation work
or reduce draw calls below the existing one-batch-per-block path. Exact precision
checks can intentionally decline instancing, including for differently styled trees.

#### Loading, interaction and resource use

| Technique | Implementation and scope |
| --- | --- |
| Bounded, prioritized source work | Nearest blocks load first, with four shared build slots and at most two per source layer. Feature processing yields after a 4 ms budget; superseded requests are cancelled ([queue](src/sources/pump.js), [building](src/sources/buildArea.js)). |
| Bounded raster coverage | Raster loading respects archive bounds, native zoom and a capped tile radius. Parent tiles cover pending detailed tiles; obsolete tiles are pruned ([tile selection](src/raster/updateRasterTiles.js)). |
| Partial archive reads and caching | PMTiles uses HTTP byte ranges, cached directory promises shared by concurrent reads, a bounded directory cache and binary search ([reads](src/archives/read.js), [lookup](src/archives/getZxy.js)). |
| Picking broad phase | A local bounding-box test rejects meshes before triangle intersection. Feature metadata uses sorted face ranges and binary search ([intersection](src/collision/intersectMeshes.js), [feature lookup](src/picking/findFeature.js)). |
| Shader highlighting | Selection changes a uniform vertex range without rewriting vertex colors ([highlight](src/picking/setHighlight.js)). |
| Explicit GPU cleanup | Removed source buffers are destroyed; replaced textures/buffers can be retired after submitted GPU work completes. Retained CPU attribute data supports rebuilding resources on another device ([release](src/sources/releaseArea.js), [deferred destruction](src/rendering/destroyTexture.js), [restoration](src/scene/restoreObject.js)). |

These are implementation techniques, not guaranteed FPS improvements. Measure CPU
and GPU frame time, slow frames, allocations and memory on representative scenes.
GPU frustum culling, indirect draws, GPU light-grid construction and GPU model
conformation are **not implemented**.

#### Source-style checks

Structural tests prohibit arrows, nested functions and callback array iteration,
allow at most one function and export per file, require exported module-level
constants/state in their dedicated folders, and keep source directories flat.
These organizational constraints are not performance measurements.

The loop check rejects `const`, `let` and `var` declarations in both loop headers
and bodies, including nested blocks and destructuring. Declare local variables
before the loop and assign them inside; global state is **not** required:

```js
let i, value;
for (i = 0; i < values.length; i++) {
  value = values[i];
}
```

The loop rule currently reports existing source violations; adding the check does
not migrate all loops automatically.

**Compatibile with:**
[![Leaflet 1.9.4 compatible!](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](http://leafletjs.com/reference.html) [![Leaflet 2.x compatible!](https://img.shields.io/badge/Leaflet-2.0.0--alpha.1-1EB300.svg?style=flat)](http://leafletjs.com/reference.html)