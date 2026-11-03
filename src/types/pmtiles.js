import './3d.js';
import { read } from '../utils/read.js';
import { getHeader } from '../utils/getHeader.js';
import { getZxy } from '../utils/getZxy.js';
import { decompress } from '../utils/decompress.js';
import { _releaseTile } from '../utils/_releaseTile.js';
import { _releaseURL } from '../utils/_releaseURL.js';
import { _registerTerrainTile } from '../utils/_registerTerrainTile.js';
import { _setTerrain3D } from '../utils/_setTerrain3D.js';
import { _abortLoading } from '../utils/_abortLoading.js';
import { createTile } from '../utils/createTile.js';
import { onPMTileAdd } from '../utils/onPMTileAdd.js';
import { onPMTileRemove } from '../utils/onPMTileRemove.js';
import { setPMTileOpacity } from '../utils/setPMTileOpacity.js';
import { setPMTileZIndex } from '../utils/setPMTileZIndex.js';
import { initPMTileLayer } from '../utils/initPMTileLayer.js';

/** A raster TileLayer backed by the shared PMTiles reader. */
L.Layer.types.pmtiles = L.TileLayer.extend({
  initialize(options)                { return initPMTileLayer(this, options); },
  _read(offset, length, signal)      { return read(this, offset, length, signal); },
  _decompress(data, compression)     { return decompress(data, compression); },
  getHeader()                        { return getHeader(this); },
  getZxy(z, x, y, signal)            { return getZxy(this, z, x, y, signal); },
  onAdd(map)                         { return onPMTileAdd(this, map); },
  onRemove(map)                      { return onPMTileRemove(this, map); },
  setOpacity(opacity)                { return setPMTileOpacity(this, opacity); },
  setZIndex(zIndex)                  { return setPMTileZIndex(this, zIndex); },
  createTile(coords, done)           { return createTile(this, coords, done); },
  _abortLoading()                    { return _abortLoading(this); },
  _setTerrain3D(terrain)             { return _setTerrain3D(this, terrain); },
  _registerTerrainTile(coords, tile) { return _registerTerrainTile(this, coords, tile); },
  _releaseURL:                       _releaseURL,
  _releaseTile(event)                { return _releaseTile(this, event); },
});

