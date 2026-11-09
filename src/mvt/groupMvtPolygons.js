import { finiteMvtCoordinate } from './finiteMvtCoordinate.js';

export function groupMvtPolygons(rings) {
  const polygons = /* alloc */ [];
  let polygon, exteriorSign, ring, area, i;
  for (ring of rings) {
    if (ring.length < 4 || ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) {
      throw /* alloc */ new Error('MVT tessellation requires closed rings');
    }
    area = 0;
    for (i = 1; i < ring.length; i++) {
      if (!finiteMvtCoordinate(ring[i]) || !finiteMvtCoordinate(ring[i - 1])) {
        throw /* alloc */ new Error('Invalid MVT ring coordinate');
      }
      area += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1];
    }
    if (!polygon || area && Math.sign(area) === exteriorSign) {
      polygon = /* alloc */ [];
      polygons.push(polygon);
      exteriorSign = Math.sign(area);
    }
    polygon.push(ring);
  }
  return polygons;
}
