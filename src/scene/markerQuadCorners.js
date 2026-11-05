import { localPosition } from './localPosition.js';

export function markerQuadCorners(state, key, image) {
  const { source, map, backend } = state;
  const world = new DOMPoint(...localPosition(state, source.getLatLng()), 1)
    .matrixTransform(new DOMMatrix(backend.root.worldMatrix));
  const clip = world.matrixTransform(new DOMMatrix(backend.camera.projectionViewMatrix));
  const inverse = new DOMMatrix(backend.camera.projectionViewMatrix).inverse();
  const toLocal = new DOMMatrix(backend.root.worldMatrix).inverse();
  const options = source.options.icon.options, size = map.getSize();
  const dimensions = options[key === 'shadow' ? 'shadowSize' : 'iconSize'] ||
    [image.naturalWidth, image.naturalHeight];
  const width = dimensions.x ?? dimensions[0], height = dimensions.y ?? dimensions[1];
  const anchor = (key === 'shadow' && options.shadowAnchor) ||
    options.iconAnchor || [Math.floor(width / 2), Math.floor(height / 2)];
  const center = new L.Point((clip.x / clip.w + 1) * size.x / 2, (1 - clip.y / clip.w) * size.y / 2);
  const left = center.x - (anchor.x ?? anchor[0]), top = center.y - (anchor.y ?? anchor[1]);
  const screenCorners = [[left, top], [left + width, top],
    [left, top + height], [left + width, top + height]];
  const corners = [];
  for (const [pointX, pointY] of screenCorners) {
    const offset = source._cameraIconPoint(pointX - center.x, pointY - center.y);
    const x = center.x + offset.x, y = center.y + offset.y;
    const p = new DOMPoint(x / size.x * 2 - 1,
      1 - y / size.y * 2, clip.z / clip.w, 1).matrixTransform(inverse);
    const result = new DOMPoint(p.x / p.w, p.y / p.w, p.z / p.w, 1).matrixTransform(toLocal);
    corners.push([result.x, result.y, result.z]);
  }
  return corners;
}
