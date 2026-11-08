import { projectedTree } from '../projections/projectTreePoint.js';
import { buildProjectedPoint } from '../geometry/buildProjectedPoint.js';

export function buildAreaPoint(context, feature, lon, lat, style, baseColor) {
  const projected = projectedTree(context, lon, lat);
  buildProjectedPoint(context, projected, style, baseColor, feature.properties?.cod_ouvrag || `${lon},${lat}`);
}
