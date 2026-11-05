import { coreWhite } from '../globals/coreWhite.js';

import { styleNativeMesh } from './styleNativeMesh.js';
import { quadNativeMesh } from './quadNativeMesh.js';
import { boundsQuad } from './boundsQuad.js';


export function syncGridLayer(state) {
  const { source, textures, meshes } = state;
  let key, tile, opacity, retained, mesh, nw, se;
  for (key in source._tiles) {
    if (!Object.hasOwn(source._tiles, key)) continue;
    tile = source._tiles[key];
    if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) continue;
    opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
    retained = textures.get(key);
    mesh = meshes.get(key);
    if (mesh && retained?.image === tile.el && retained.url === (tile.el.currentSrc || tile.el.src)) {
      retained.used = true;
      styleNativeMesh(state, mesh, coreWhite, opacity);
    } else {
      [nw, se] = source._tileCoordsToNwSe(tile.coords);
      mesh = quadNativeMesh(state, key, tile.el, boundsQuad(state,
        /* allocation: required -- Native corner normalization belongs to this tile's mesh construction. */ new L.LatLngBounds(nw, se)), opacity);
    }
    if (mesh) mesh.renderOrder += tile.coords.z / 100;
  }
}
