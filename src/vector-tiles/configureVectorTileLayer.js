import { L } from '../globals/L.js';
import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { vectorTileSettings } from './vectorTileSettings.js';
import { onVectorTileAdd } from './onVectorTileAdd.js';
import { onVectorTileRemove } from './onVectorTileRemove.js';
import { updateVectorTiles } from './updateVectorTiles.js';
import { updateVectorTilePaint } from './updateVectorTilePaint.js';
import { updateVectorTileLabels } from './updateVectorTileLabels.js';
import { pruneVectorTiles } from './pruneVectorTiles.js';
import { retireVectorTileGroup } from './retireVectorTileGroup.js';
import { pumpVectorTiles } from './pumpVectorTiles.js';
import { loadVectorTile } from './loadVectorTile.js';

export async function configureVectorTileLayer(layer, options) {
  const settings = await vectorTileSettings(options);
  const { url, tileJSON, style, sourceId, minNativeZoom, maxNativeZoom, maxZoom, ...core } = settings;
  L.Util.setOptions(layer, core);
  settings.pane = `mvt-${L.Util.stamp(layer)}`;
  vectorTileOptionsByLayer.set(layer, settings);
  Object.assign(layer, /* alloc */ {
    onAdd: onVectorTileAdd, onRemove: onVectorTileRemove, update: updateVectorTiles,
    updatePaint: updateVectorTilePaint, updateLabels: updateVectorTileLabels,
    prune: pruneVectorTiles, retire: retireVectorTileGroup, pump: pumpVectorTiles, load: loadVectorTile,
  });
  return layer;
}
