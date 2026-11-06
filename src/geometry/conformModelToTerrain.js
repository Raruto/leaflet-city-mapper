import { modelByLayer } from '../weakmaps/modelByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainZoomByLayer } from '../weakmaps/terrainZoomByLayer.js';

import { radians } from '../globals/radians.js';
import { L } from '../globals/L.js';
import { HEIGHT } from '../globals/HEIGHT.js';


import { computeBounds } from './computeBounds.js';
import { getElevation } from '../terrain/getElevation.js';
import { update } from '../scene/scheduleSceneUpdate.js';
import { updateWorldMatrix } from '../transforms/updateWorldMatrix.js';
import { vertexNormals } from './vertexNormals.js';
import { collectMeshes } from '../collision/collectMeshes.js';

export function conformModelToTerrain(layer, terrain) {
  if (!modelByLayer.get(layer)) return;
  const meshes = /* alloc */ [];
  collectMeshes(modelByLayer.get(layer), meshes);
  let mesh, positions, geometry, position, normals, attribute, normal, world, inverse, i, x, y, z;
  let worldY, weight, worldX, worldZ, point, elevation, offset;
  if (!terrainReadyByLayer.get(terrain) || !layer.options.terrainConform) {
    for (mesh of meshes) {
      positions = mesh.geometry._terrainBasePositions;
      if (!positions) continue;
      geometry = mesh.geometry, position = geometry.attributes.position;
      position.data.set(positions);
      mesh.device.queue.writeBuffer(position.buffer, 0, positions);
      normals = geometry._terrainBaseNormals;
      if (normals) {
        geometry.attributes.normal.data.set(normals);
        mesh.device.queue.writeBuffer(geometry.attributes.normal.buffer, 0, normals);
      }
      computeBounds(geometry);
    }
    return;
  }

  updateWorldMatrix(rootByLayer.get(layer));
  const map = layer._map, crs = map.options.crs;
  const origin = crs.project(sceneOriginByLayer.get(sharedByLayer.get(layer)));
  const metres = Math.cos(sceneOriginByLayer.get(sharedByLayer.get(layer)).lat * radians);
  const pixelScale = crs.scale(terrainZoomByLayer.get(terrain));

  for (mesh of meshes) {
    geometry = mesh.geometry, attribute = geometry.attributes.position;
    geometry._terrainBasePositions ||= attribute.data.slice();
    normal = geometry.attributes.normal;
    geometry._terrainBaseNormals ||= normal.data.slice();
    attribute.data.set(geometry._terrainBasePositions);
    world = mesh.worldMatrix, inverse = /* alloc */ new DOMMatrix(world).inverse().toFloat64Array();
    for (i = 0; i < attribute.data.length; i += 3) {
      x = attribute.data[i], y = attribute.data[i + 1], z = attribute.data[i + 2];
      worldY = world[1] * x + world[5] * y + world[9] * z + world[13];
      weight = Math.max(0, Math.min(1, 1 - (worldY - rootByLayer.get(layer).position[1]) / HEIGHT));
      if (!weight) continue;
      worldX = world[0] * x + world[4] * y + world[8] * z + world[12];
      worldZ = world[2] * x + world[6] * y + world[10] * z + world[14];
      point = crs.transformation.transform(/* alloc */ new L.Point(
        origin.x + worldX / metres, origin.y - worldZ / metres), pixelScale);
      elevation = getElevation(terrain, point);
      if (!Number.isFinite(elevation)) continue;
      offset = (elevation - worldY) * weight;
      attribute.data[i] += inverse[4] * offset;
      attribute.data[i + 1] += inverse[5] * offset;
      attribute.data[i + 2] += inverse[6] * offset;
    }
    mesh.device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    normal.data.set(vertexNormals(attribute.data, geometry.attributes.index?.data));
    mesh.device.queue.writeBuffer(normal.buffer, 0, normal.data);
    computeBounds(geometry);
  }
  update(layer);
}
