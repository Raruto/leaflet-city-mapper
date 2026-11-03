# leaflet-city-mapper

[![NPM version](https://img.shields.io/npm/v/leaflet-city-builder.svg?color=red)](https://www.npmjs.com/package/leaflet-city-builder)
[![License](https://img.shields.io/badge/license-GPL%203-blue.svg?style=flat)](LICENSE)

**Your data, on a rotated and pitched Leaflet map:** a small 3D rendering engine (WebGPU) packaged onto standard `L.Layer`. Available sources: extruded GeoJSON, glTF models, PMTiles and terrain layers.

<p align="center">
    <a href="https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html"><img src="https://raruto.github.io/img/leaflet-city-mapper.png" alt="Leaflet 3D City Mapper" /></a>
</p>

_For a working example see one of the following demos:_

- [City of Paris in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper.html)
- [Ancient Rome in 3D](https://raruto.github.io/leaflet-city-mapper/examples/leaflet-city-mapper-geojson.html)

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
    featureStyle: ({ properties }) => ({ top: properties.height, color: properties.color }),
    tooltipContent: ({ properties }) => `${properties.name}: ${properties.height} m`,
  },
}).addTo(map);
```

After that, the [`dist/types/geojson.js`](./src/types/geojson.js) will be dynamically imported into the page and a 3D layer should appear onto the map.

For further customization, you can define custom [`types`](./src/types/geojson.js): just upload them to the same folder and they will be loaded automatically.

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