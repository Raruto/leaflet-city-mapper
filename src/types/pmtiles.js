import './3d.js';
import { read } from '../utils/read.js';
import { getHeader } from '../utils/getHeader.js';
import { getZxy } from '../utils/getZxy.js';
import { decompress } from '../utils/decompress.js';
import { onPMTileAdd } from '../utils/onPMTileAdd.js';
import { onPMTileRemove } from '../utils/onPMTileRemove.js';
import { setPMTileOpacity } from '../utils/setPMTileOpacity.js';
import { setPMTileZIndex } from '../utils/setPMTileZIndex.js';
import { initPMTileLayer } from '../utils/initPMTileLayer.js';
import { getRasterTileSize, registerTerrainTile, setRasterTerrain, updateRasterTiles } from '../utils/rasterTiles.js';

/** Raster PMTiles rendered as textured meshes in the shared WebGPU canvas. */
L.Layer.types.pmtiles = L.Layer.extend({
  options: { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0 },
  initialize(options)                { return initPMTileLayer(this, options); },
  _read(offset, length, signal)      { return read(this, offset, length, signal); },
  _decompress(data, compression)     { return decompress(data, compression); },
  getHeader()                        { return getHeader(this); },
  getZxy(z, x, y, signal)            { return getZxy(this, z, x, y, signal); },
  onAdd(map)                         { return onPMTileAdd(this, map); },
  onRemove(map)                      { return onPMTileRemove(this, map); },
  getEvents()                        { return {
    moveend: updateRasterTiles.bind(null, this),
    zoomend: updateRasterTiles.bind(null, this),
    rotate: updateRasterTiles.bind(null, this),
    pitch: updateRasterTiles.bind(null, this),
    resize: updateRasterTiles.bind(null, this),
  }; },
  getTileSize()                      { return getRasterTileSize(); },
  isLoading()                        { return this._loadingTiles > 0; },
  setOpacity(opacity)                { return setPMTileOpacity(this, opacity); },
  setZIndex(zIndex)                  { return setPMTileZIndex(this, zIndex); },
  _setTerrain3D(terrain)             { return setRasterTerrain(this, terrain); },
  _registerTerrainTile(coords, tile) { return registerTerrainTile(this, coords, tile); },
});
