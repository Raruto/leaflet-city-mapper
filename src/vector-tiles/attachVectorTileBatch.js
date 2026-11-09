import { L } from '../globals/L.js';
import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { vectorStyleZoom } from './vectorStyleZoom.js';
import { vectorTilePaint } from './vectorTilePaint.js';
import { forwardVectorTileError } from './forwardVectorTileError.js';

export function attachVectorTileBatch(owner, tile, group, batch) {
  const { pane } = vectorTileOptionsByLayer.get(owner);
  const paint = vectorTilePaint(batch, vectorStyleZoom(owner));
  const options = /* alloc */ { ...paint, pane: `${pane}-${batch.order}`, interactive: false, smoothFactor: 0 };
  const layer = batch.kind === 'fill'
    ? /* alloc */ new L.Polygon(batch.paths, /* alloc */ { ...options, stroke: false, triangulated: true })
    : /* alloc */ new L.Polyline(batch.paths, options);
  layer.on('error', forwardVectorTileError, owner);
  tile.rendered.push(/* alloc */ { layer, kind: batch.kind, entry: batch.entry, properties: batch.properties });
  group.addLayer(layer);
}
