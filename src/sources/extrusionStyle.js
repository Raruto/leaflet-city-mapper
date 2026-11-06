export function extrusionStyle(backend, feature) {
  const style = backend.options.style(feature);
  if (style === null) return null;
  if (!style || typeof style !== 'object') throw /* alloc */ new Error('style must return an extrusion style or null');
  const { top, bottom = 0 } = style;
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
    throw /* alloc */ new Error('Invalid extrusion heights: expected top > bottom >= 0');
  }
  return style;
}
