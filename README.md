# leaflet-city-mapper

[![NPM version](https://img.shields.io/npm/v/leaflet-city-builder.svg?color=red)](https://www.npmjs.com/package/leaflet-city-builder)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg?style=flat)](LICENSE)

**Your data, on a rotated and pitched Leaflet map:** a small 3D rendering engine (WebGPU) packaged onto standard `L.Layer`. Available sources: extruded GeoJSON, glTF models, raster PMTiles and terrain layers.

<p align="center">
    <a href="https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html"><img src="https://raruto.github.io/img/leaflet-city-mapper.png" alt="Leaflet 3D City Mapper" /></a>
</p>

_For a working example see one of the following demos:_

- [City of Paris in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html)
- [Ancient Rome in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-geojson.html)
- [Native Leaflet layers on WebGPU](./examples/leaflet-city-mapper-native.html)

## How to use

Load leaflet and leaflet-rotate first, then this plugin:


```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-rotate@0.5.3/dist/leaflet-rotate.js"></script>
<script src="https://unpkg.com/leaflet-city-mapper@0.0.1/dist/leaflet-city-mapper.js"></script>
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

Vector and raster layers are initialized in [`src/index.js`](./src/index.js); their rendering utilities are loaded only when needed. Terrain, sunlight, traffic and walk initializers are also loaded lazily from [`src/utils`](./src/utils).

Initialization and shared renderer state live directly on `L.Layer`, without a type registry. Supported `source.type` values are `3d`, `geojson`, `pmtiles`, `terrain`, `sunlight`, `traffic` and `walk`; unknown types emit an `error` event and reject `layer.ready`. Leaflet subclasses keep their own initialization.

### Native Leaflet layers

Loading the plugin automatically renders native `TileLayer` (including WMS), image/canvas `GridLayer` tiles, `ImageOverlay`, image-icon `Marker`, `Polyline`, `Polygon`, `Rectangle`, `Circle` and `CircleMarker` content in the shared WebGPU canvas. `GeoJSON`, `LayerGroup` and `FeatureGroup` work through their children, with their original constructors and methods.

The common `L.Layer` lifecycle loads the adapter lazily. Paths are triangulated directly from coordinates, without creating SVG or Canvas 2D renderers, and use GPU-scene raycasting for pointer events. Tiles and overlay images load in detached elements: they are texture sources, not DOM snapshots. Image markers use coordinate-derived GPU billboards; only their transparent, accessible DOM controls remain for keyboard focus and dragging, without per-frame layout measurements. Leaflet still owns requests, popups and attribution.

Mutators such as `setLatLng`, `setStyle`, `setRadius`, `setOpacity`, `setUrl` and `redraw`, as well as removal/re-adding, update GPU resources. Path buffers remain unchanged during pan, rotation and pitch; pixel-width strokes are retessellated on `zoomend` or source changes. The untransformed GPU canvas sits above the pitch sky and below Leaflet's panes: tall objects remain visible above the horizon, while popups, tooltips and controls stay in front. `layer.ready` reports GPU initialization; native `load`/`tileload` events still report image/tile loading. Rendering failures emit `error`, without silently falling back to DOM rendering.

Cross-origin images and tile services must permit CORS; the plugin enables `crossOrigin` before loading. HTML `DivIcon`, video/SVG overlays, popup, tooltip and controls intentionally stay in the DOM. Custom HTML `GridLayer` tiles are not raster images and report an error. The [native gallery](./examples/leaflet-city-mapper-native.html) includes every supported native layer type; append `?canvas` to verify that `preferCanvas` also uses direct GPU paths instead of a duplicate Canvas 2D renderer.

### Update demo data

The Paris example makes extensive use of [PMTiles](./build/pmtiles.js) to ensure offline access / long-term availability of the map. To update them:

```shell
npm run pmtiles
node build/pmtiles.js --only=trees
```

### Build Guide

Within your local development environment:

```shell
git clone git@github.com:Raruto/leaflet-city-builder.git
cd ./leaflet-city-builder

npm i         # install dependencies
npm run dev   # start dev server at: http://localhost:8080
npm run build # generate "dist" files (once)
npm run test  # build and run browser tests
```

After that you can start developing inside the `src` and `test` folders (eg. open "http://localhost:8080" in your browser to preview changes).


**Compatibile with:**
[![Leaflet 1.9.4 compatible!](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](http://leafletjs.com/reference.html) [![Leaflet 2.x compatible!](https://img.shields.io/badge/Leaflet-2.0.0--alpha.1-1EB300.svg?style=flat)](http://leafletjs.com/reference.html)