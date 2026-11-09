import { projectedTree } from '../projections/projectTreePoint.js';
import { parseColor } from '../colors/parseColor.js';
import { projectAreaPolygons } from './projectAreaPolygons.js';

export function prepareAreaGeometryJob(context, feature, lon, lat, style, baseColor) {
  const geometry = feature.geometry;
  const polygons = projectAreaPolygons(context, geometry);
  const point = geometry.type === 'Point' ? projectedTree(context, lon, lat) : null;
  const nightLight = context.backend.options.nightLight;
  const crownColor = point ? parseColor(style.color ?? (nightLight ? undefined : 0x4f823b)) : baseColor;
  const trunkColor = point && !nightLight ? parseColor(style.trunkColor ?? 0x72513a) : null;
  context.jobs.push(/* alloc */ {
    point, polygons, baseColor: /* alloc */ { r: baseColor.r, g: baseColor.g, b: baseColor.b },
    support: feature.properties?.cod_ouvrag || `${lon},${lat}`,
    style: /* alloc */ {
      top: style.top, bottom: style.bottom ?? 0,
      color: /* alloc */ { r: crownColor.r, g: crownColor.g, b: crownColor.b },
      trunkColor: trunkColor ? /* alloc */ { r: trunkColor.r, g: trunkColor.g, b: trunkColor.b } : undefined,
      trunkRadius: style.trunkRadius, crownRadius: style.crownRadius,
      crownBottom: style.crownBottom, crownShape: style.crownShape,
      poleRadius: style.poleRadius, lightRadius: style.lightRadius, lightFlux: style.lightFlux,
    },
  });
}
