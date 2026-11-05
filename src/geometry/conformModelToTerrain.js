import { sceneByLayer } from '../globals/sceneByLayer.js';
import { HEIGHT } from '../globals/HEIGHT.js';


import { computeBounds } from './computeBounds.js';
import { getElevation } from '../terrain/getElevation.js';
import { update } from '../scene/update.js';
import { updateWorldMatrix } from '../scene/updateWorldMatrix.js';
import { vertexNormals } from './vertexNormals.js';
import { collectMeshes } from '../collision/collectMeshes.js';

export function conformModelToTerrain(layer, terrain) {
  if (!sceneByLayer.get(layer).model) return;
  const meshes = /* allocation: required -- Mesh traversal stays private while GPU and terrain callbacks may reenter conformity. */ [];
  collectMeshes(sceneByLayer.get(layer).model, meshes);
  let mesh, positions, geometry, position, normals, attribute, normal, world, inverse, i, x, y, z;
  let worldY, weight, worldX, worldZ, point, elevation, offset;
  if (!sceneByLayer.get(terrain)?._terrainReady || !layer.options.terrainConform) {
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

  updateWorldMatrix(sceneByLayer.get(layer).root);
  const map = layer._map, crs = map.options.crs;
  const origin = crs.project(sceneByLayer.get(sceneByLayer.get(layer)._shared)._sceneOrigin);
  const metres = Math.cos(sceneByLayer.get(sceneByLayer.get(layer)._shared)._sceneOrigin.lat * Math.PI / 180);
  const pixelScale = crs.scale(sceneByLayer.get(terrain)._terrainZoom);

  for (mesh of meshes) {
    geometry = mesh.geometry, attribute = geometry.attributes.position;
    geometry._terrainBasePositions ||= attribute.data.slice();
    normal = geometry.attributes.normal;
    geometry._terrainBaseNormals ||= normal.data.slice();
    attribute.data.set(geometry._terrainBasePositions);
    world = mesh.worldMatrix, inverse = /* allocation: required -- The inverse matrix is bound to this mesh transform during terrain sampling. */ new DOMMatrix(world).inverse().toFloat64Array();
    for (i = 0; i < attribute.data.length; i += 3) {
      x = attribute.data[i], y = attribute.data[i + 1], z = attribute.data[i + 2];
      worldY = world[1] * x + world[5] * y + world[9] * z + world[13];
      weight = Math.max(0, Math.min(1, 1 - (worldY - sceneByLayer.get(layer).root.position[1]) / HEIGHT));
      if (!weight) continue;
      worldX = world[0] * x + world[4] * y + world[8] * z + world[12];
      worldZ = world[2] * x + world[6] * y + world[10] * z + world[14];
      point = crs.transformation.transform(/* allocation: required -- The CRS transformation may retain or mutate this vertex coordinate. */ new L.Point(
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
