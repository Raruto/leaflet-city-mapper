import { L } from '../globals/L.js';
import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { vectorLabelIcon } from './vectorLabelIcon.js';
import { rotateVectorLabel } from './rotateVectorLabel.js';
import { forwardVectorTileError } from './forwardVectorTileError.js';

/**
 * Create or update a marker for a vector label candidate.
 *
 * @param {Object} owner Vector tile layer.
 * @param {Object} label Label candidate.
 * @param {string} key Label identity key.
 *
 * @returns {boolean} Whether the marker was created or its appearance changed.
 */
export function updateVectorLabelMarker(owner, label, key) {
  const appearance = JSON.stringify(/* alloc */ [label.size, label.color, label.halo, label.haloWidth, label.icon]);
  const sheet = vectorTileOptionsByLayer.get(owner).spriteSheet;
  let marker = owner.labels.get(key);
  if (marker) {
    marker._mvtLabel = label;
    if (marker._mvtLabelStyle === appearance) { rotateVectorLabel(owner._map, marker, label); return false; }
    marker.setIcon(vectorLabelIcon(label, sheet));
  } else {
    const { pane } = vectorTileOptionsByLayer.get(owner);
    marker = /* alloc */ new L.Marker(label.latlng, /* alloc */ {
      icon: vectorLabelIcon(label, sheet), pane: `${pane}-${label.order}`, title: label.text,
      alt: label.text, interactive: false, keyboard: false, rotateWithView: false,
    }).on('error', forwardVectorTileError, owner).addTo(owner._map);
    owner.labels.set(key, marker);
  }
  marker._mvtLabelStyle = appearance;
  marker._mvtLabel = label;
  rotateVectorLabel(owner._map, marker, label);
  return true;
}
