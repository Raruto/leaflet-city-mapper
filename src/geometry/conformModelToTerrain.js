import { computeBounds } from './computeBounds.js';
import { getElevation } from '../terrain/getElevation.js';
import { update } from '../scene/update.js';
import { updateWorldMatrix } from '../scene/updateWorldMatrix.js';
import { vertexNormals } from './vertexNormals.js';
import { collectMeshes } from './collectMeshes.js';
import { HEIGHT } from './constants/HEIGHT.js';

export function conformModelToTerrain(layer, terrain) {
  if (!layer.model) return;
  const meshes = [];
  collectMeshes(layer.model, meshes);
  if (!terrain?._terrainReady || !layer.options.terrainConform) {
    for (const mesh of meshes) {
      const positions = mesh.geometry._terrainBasePositions;
      if (!positions) continue;
      const geometry = mesh.geometry, position = geometry.attributes.position;
      position.data.set(positions);
      mesh.device.queue.writeBuffer(position.buffer, 0, positions);
      const normals = geometry._terrainBaseNormals;
      if (normals) {
        geometry.attributes.normal.data.set(normals);
        mesh.device.queue.writeBuffer(geometry.attributes.normal.buffer, 0, normals);
      }
      computeBounds(geometry);
    }
    return;
  }

  updateWorldMatrix(layer.root);
  const map = layer._map, crs = map.options.crs;
  const origin = crs.project(layer._shared._sceneOrigin);
  const metres = Math.cos(layer._shared._sceneOrigin.lat * Math.PI / 180);
  const pixelScale = crs.scale(terrain._terrainZoom);

  for (const mesh of meshes) {
    const geometry = mesh.geometry, attribute = geometry.attributes.position;
    geometry._terrainBasePositions ||= attribute.data.slice();
    const normal = geometry.attributes.normal;
    geometry._terrainBaseNormals ||= normal.data.slice();
    attribute.data.set(geometry._terrainBasePositions);
    const world = mesh.worldMatrix, inverse = new DOMMatrix(world).inverse().toFloat64Array();
    for (let i = 0; i < attribute.data.length; i += 3) {
      const x = attribute.data[i], y = attribute.data[i + 1], z = attribute.data[i + 2];
      const worldY = world[1] * x + world[5] * y + world[9] * z + world[13];
      const weight = Math.max(0, Math.min(1, 1 - (worldY - layer.root.position[1]) / HEIGHT));
      if (!weight) continue;
      const worldX = world[0] * x + world[4] * y + world[8] * z + world[12];
      const worldZ = world[2] * x + world[6] * y + world[10] * z + world[14];
      const point = crs.transformation.transform(new L.Point(
        origin.x + worldX / metres, origin.y - worldZ / metres), pixelScale);
      const elevation = getElevation(terrain, point);
      if (!Number.isFinite(elevation)) continue;
      const offset = (elevation - worldY) * weight;
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
