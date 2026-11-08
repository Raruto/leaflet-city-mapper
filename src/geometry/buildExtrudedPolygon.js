import { projectRing } from '../projections/projectRing.js';
import { buildProjectedPolygon } from './buildProjectedPolygon.js';

export function buildAreaPolygon(context, rings, top, bottom, baseColor) {
  if (!rings.length) throw /* alloc */ new Error('Empty GeoJSON polygon');
  const paths = /* alloc */ [];
  let ring;
  for (ring of rings) paths.push(projectRing(context, ring));
  buildProjectedPolygon(context, paths, top, bottom, baseColor);
}
