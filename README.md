# leaflet-city-mapper

[![NPM version](https://img.shields.io/npm/v/leaflet-city-mapper.svg?color=red)](https://www.npmjs.com/package/leaflet-city-mapper)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg?style=flat)](LICENSE)

**Your data, on a rotated and pitched Leaflet map:** a small 3D rendering engine (WebGPU) packaged onto standard `L.Layer`. Available sources: extruded GeoJSON, glTF models, raster PMTiles, COG and terrain layers.

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
    roofTexture: true,
    wallTexture: 0.75,
  },
}).addTo(map);
```

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
  cog/               Supported GeoTIFF directories, byte ranges and tile decoding
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