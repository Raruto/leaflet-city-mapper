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
- [Native Leaflet layers on WebGPU](https://raruto.github.io/leaflet-city-mapper/examples/examples/leaflet-city-mapper-native.html)

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

Vector and raster layers are initialized in [`src/index.js`](./src/index.js); their rendering utilities are loaded only when needed. Terrain, sunlight, traffic and walk initializers are also loaded lazily from [`src/utils`](./src/utils).

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


**Compatibile with:**
[![Leaflet 1.9.4 compatible!](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](http://leafletjs.com/reference.html) [![Leaflet 2.x compatible!](https://img.shields.io/badge/Leaflet-2.0.0--alpha.1-1EB300.svg?style=flat)](http://leafletjs.com/reference.html)