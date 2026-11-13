import { rotateVectorLabel } from './rotateVectorLabel.js';

/**
 * Update the rotation of the bound layer's line labels.
 */
export function rotateVectorLabels() {
  let marker;
  for (marker of this.labels.values()) if (marker._mvtLabel) rotateVectorLabel(this._map, marker, marker._mvtLabel);
}
