import { radians } from '../globals/radians.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { createMesh } from '../rendering/createMesh.js';
import { bridgePolygon } from './bridgePolygon.js';

/**
 * Bare-earth DEMs drop bridges: `getElevation` returns the deck height inside these polygons (GeoJSON
 * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
 * ponytail: anything under a deck (quays, boats asking `getElevation`) also gets the deck height.
 */
export function addBridges(backend, geojson) {
  const map = backend._map, crs = map.options.crs, zoom = sceneByLayer.get(backend)._terrainZoom;
  const origin = crs.project(sceneByLayer.get(backend).location), metres = Math.cos(sceneByLayer.get(backend).location.lat * radians);
  const base = sceneByLayer.get(backend).root.position[1];
  const position = /* alloc */ [], normal = /* alloc */ [], color = /* alloc */ [];
  sceneByLayer.get(backend)._bridges = /* alloc */ new Map();
  const context = /* alloc */ { backend, map, crs, zoom, origin, metres, base, position, normal, color };
  let geometry, polygons, polygonIndex;
  for ({ geometry } of geojson.features) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    polygons = geometry.coordinates;
    for (polygonIndex = 0; polygonIndex < (geometry.type === 'Polygon' ? 1 : polygons.length); polygonIndex++) {
      bridgePolygon(context, geometry.type === 'Polygon' ? polygons : polygons[polygonIndex]);
    }
  }
  if (position.length) {
    sceneByLayer.get(backend)._bridgeMesh = createMesh(backend, /* alloc */ { position, normal, color });
  }
}
