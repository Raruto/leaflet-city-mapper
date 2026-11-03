import { update } from './update.js';

/** Highlight a source vertex range in the shader; vertex colors stay untouched. */

export function setHighlight(backend, feature) {
  if (feature?.model) feature = null;
  if (backend.highlightedFeature?.mesh === feature?.mesh &&
    backend.highlightedFeature?.vertexStart === feature?.vertexStart) return;
  if (backend.highlightedFeature) backend.highlightedFeature.mesh.highlight = null;
  backend.highlightedFeature = feature;
  if (feature) feature.mesh.highlight = [feature.vertexStart, feature.vertexEnd];
  update(backend);
}
