import { projectedTree } from '../projections/projectTreePoint.js';
import { projectRing } from '../projections/projectRing.js';
import { parseColor } from '../colors/parseColor.js';

export function prepareAreaGeometryJob(context, feature, lon, lat, style, baseColor) {
  const geometry = feature.geometry;
  const polygons = /* alloc */ [];
  const rings = geometry.type === 'Polygon' ? /* alloc */ [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates : /* alloc */ [];
  let polygon, ring, paths;
  for (polygon of rings) {
    if (!polygon.length) throw /* alloc */ new Error('Empty GeoJSON polygon');
    paths = /* alloc */ [];
    for (ring of polygon) paths.push(projectRing(context, ring));
    polygons.push(paths);
  }
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
