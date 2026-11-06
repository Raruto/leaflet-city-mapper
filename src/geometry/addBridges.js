import { bridgeMeshByLayer } from '../weakmaps/bridgeMeshByLayer.js';
import { bridgesByLayer } from '../weakmaps/bridgesByLayer.js';
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { terrainZoomByLayer } from '../weakmaps/terrainZoomByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';

import { radians } from '../globals/radians.js';
import { createMesh } from '../rendering/createMesh.js';
import { bridgePolygon } from './bridgePolygon.js';

/**
 * Bare-earth DEMs drop bridges: `getElevation` returns the deck height inside these polygons (GeoJSON
 * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
 * ponytail: anything under a deck (quays, boats asking `getElevation`) also gets the deck height.
 */
export function addBridges(layer, geojson) {
  const map = layer._map, crs = map.options.crs, zoom = terrainZoomByLayer.get(layer);
  const origin = crs.project(locationByLayer.get(layer)), metres = Math.cos(locationByLayer.get(layer).lat * radians);
  const base = rootByLayer.get(layer).position[1];
  const position = /* alloc */ [], normal = /* alloc */ [], color = /* alloc */ [];
  mutateWeakMap(bridgesByLayer, layer, "=", /* alloc */ new Map());
  const context = /* alloc */ { backend: layer, map, crs, zoom, origin, metres, base, position, normal, color };
  let geometry, polygons, polygonIndex;
  for ({ geometry } of geojson.features) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    polygons = geometry.coordinates;
    for (polygonIndex = 0; polygonIndex < (geometry.type === 'Polygon' ? 1 : polygons.length); polygonIndex++) {
      bridgePolygon(context, geometry.type === 'Polygon' ? polygons : polygons[polygonIndex]);
    }
  }
  if (position.length) {
    mutateWeakMap(bridgeMeshByLayer, layer, "=", createMesh(layer, /* alloc */ { position, normal, color }));
  }
}
