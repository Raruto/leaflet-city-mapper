import { projectedTree } from './projectedTree.js';
import { generateTreeGeometry } from './generateTreeGeometry.js';
import { lampPostGeometry } from '../geometry/lampPostGeometry.js';
import { lightGeometry } from '../geometry/lightGeometry.js';
import { treeGeometry } from '../geometry/treeGeometry.js';

export function buildAreaPoint(context, feature, lon, lat, style, baseColor) {
  const { backend } = context;
  const { top } = style;
  const projected = projectedTree(context, lon, lat);
  if (backend.options.nightLight) {
    if (!Number.isFinite(style.lightFlux) || style.lightFlux <= 0) throw /* allocation: required -- Preserve the failure stack for invalid light output. */ new Error('Invalid light flux');
    const support = feature.properties?.cod_ouvrag || `${lon},${lat}`;
    if (style.poleRadius > 0 && !context.supports.has(support)) {
      generateTreeGeometry(context, lampPostGeometry, projected, style);
      context.supports.add(support);
    }
    generateTreeGeometry(context, lightGeometry, projected, style);
    context.lights.push(/* allocation: required -- Retain independent light data for this built feature. */ {
      position: /* allocation: required -- Keep each light's GPU position independent. */ [projected.x, projected.ground + top, -projected.y],
      radius: Math.hypot(top, style.lightRadius), color: /* allocation: required -- Keep each light's color independent. */ [baseColor.r, baseColor.g, baseColor.b],
      flux: style.lightFlux,
    });
  } else generateTreeGeometry(context, treeGeometry, projected, style);
}
