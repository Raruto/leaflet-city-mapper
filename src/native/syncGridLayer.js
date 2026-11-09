import { L } from '../globals/L.js';
import { coreWhite } from '../globals/coreWhite.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';

import { styleNativeMesh } from './styleNativeMesh.js';
import { quadNativeMesh } from './quadNativeMesh.js';
import { boundsQuad } from '../geometry/boundsQuad.js';
import { loadGridTerrain } from './loadGridTerrain.js';
import { terrainGridMesh } from './terrainGridMesh.js';


export function syncGridLayer(state) {
  const { source, textures, meshes } = state;
  const stream = streamTerrainByMap.get(state.map);
  if (state.terrainStream !== stream) {
    state.terrainStream = stream;
    state.terrainRequests = stream ? /* alloc */ new Map() : null;
  }
  let key, tile, opacity, retained, mesh, nw, se, request, pending = false;
  if (state.terrainRequests) {
    for (key of state.terrainRequests.keys()) {
      if (!source._tiles[key]) state.terrainRequests.delete(key);
    }
  }
  for (key in source._tiles) {
    if (!Object.hasOwn(source._tiles, key)) continue;
    tile = source._tiles[key];
    if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) {
      if (stream) pending = true;
      continue;
    }
    opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
    retained = textures.get(key);
    mesh = meshes.get(key);
    if (state.terrainRequests) {
      request = state.terrainRequests.get(key);
      if (!request || request.tile !== tile) {
        request = /* alloc */ { tile, stream };
        state.terrainRequests.set(key, request);
        loadGridTerrain(state, key, tile, request);
      }
      if (!request.tiles) {
        pending = true;
        if (mesh && retained?.image === tile.el) {
          retained.used = true;
          styleNativeMesh(state, mesh, coreWhite, opacity);
        }
        continue;
      }
      if (mesh && mesh._terrainRequest === request && retained?.image === tile.el &&
        retained.url === (tile.el.currentSrc || tile.el.src)) {
        retained.used = true;
        styleNativeMesh(state, mesh, coreWhite, opacity);
      } else mesh = terrainGridMesh(state, key, tile, request, opacity);
    } else if (mesh && !mesh._terrainRequest && retained?.image === tile.el && retained.url === (tile.el.currentSrc || tile.el.src)) {
      retained.used = true;
      styleNativeMesh(state, mesh, coreWhite, opacity);
    } else {
      [nw, se] = source._tileCoordsToNwSe(tile.coords);
      mesh = quadNativeMesh(state, key, tile.el, boundsQuad(state,
        /* alloc */ new L.LatLngBounds(nw, se)), opacity);
    }
    if (mesh) mesh.renderOrder += tile.coords.z / 100;
  }
  if (stream && (pending || !Object.keys(source._tiles).length)) {
    for ([key, mesh] of meshes) {
      if (source._tiles[key] || !mesh._terrainRequest) continue;
      retained = textures.get(key);
      if (!retained) continue;
      retained.used = true;
      mesh._nativeUsed = true;
    }
  }
}
