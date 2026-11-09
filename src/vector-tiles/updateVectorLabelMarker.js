import { L } from '../globals/L.js';
import { vectorTileOptionsByLayer } from '../weakmaps/vectorTileOptionsByLayer.js';
import { vectorLabelIcon } from './vectorLabelIcon.js';
import { forwardVectorTileError } from './forwardVectorTileError.js';

export function updateVectorLabelMarker(owner, label, key) {
  const appearance = JSON.stringify(/* alloc */ [label.size, label.color, label.halo, label.haloWidth]);
  let marker = owner.labels.get(key);
  if (marker) {
    if (marker._mvtLabelStyle === appearance) return false;
    marker.setIcon(vectorLabelIcon(label));
  } else {
    const { pane } = vectorTileOptionsByLayer.get(owner);
    marker = /* alloc */ new L.Marker(label.latlng, /* alloc */ {
      icon: vectorLabelIcon(label), pane: `${pane}-${label.order}`, title: label.text,
      alt: label.text, interactive: false, keyboard: false, rotateWithView: false,
    }).on('error', forwardVectorTileError, owner).addTo(owner._map);
    owner.labels.set(key, marker);
  }
  marker._mvtLabelStyle = appearance;
  return true;
}
