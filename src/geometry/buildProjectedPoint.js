import { generateTreeGeometry } from './generateTreeGeometry.js';
import { lampPostGeometry } from './lampPostGeometry.js';
import { lightGeometry } from './lightGeometry.js';
import { treeGeometry } from './treeGeometry.js';

export function buildProjectedPoint(context, projected, style, baseColor, support) {
  const { top } = style;
  if (context.backend.options.nightLight) {
    if (!Number.isFinite(style.lightFlux) || style.lightFlux <= 0) throw /* alloc */ new Error('Invalid light flux');
    if (style.poleRadius > 0 && !context.supports.has(support)) {
      generateTreeGeometry(context, lampPostGeometry, projected, style);
      context.supports.add(support);
    }
    generateTreeGeometry(context, lightGeometry, projected, style);
    context.lights.push(/* alloc */ {
      position: /* alloc */ [projected.x, projected.ground + top, -projected.y],
      radius: Math.hypot(top, style.lightRadius), color: /* alloc */ [baseColor.r, baseColor.g, baseColor.b],
      flux: style.lightFlux,
    });
  } else generateTreeGeometry(context, treeGeometry, projected, style);
}
