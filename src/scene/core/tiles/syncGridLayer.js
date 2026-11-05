import { styleNativeMesh } from '../meshes/styleNativeMesh.js';
import { quadNativeMesh } from '../meshes/quadNativeMesh.js';
import { boundsQuad } from '../meshes/boundsQuad.js';

export function syncGridLayer(state) {
  const { source, textures, meshes } = state;
  for (const [key, tile] of Object.entries(source._tiles || {})) {
    if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) continue;
    const opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
    const retained = textures.get(key);
    let mesh = meshes.get(key);
    if (mesh && retained?.image === tile.el && retained.url === (tile.el.currentSrc || tile.el.src)) {
      retained.used = true;
      styleNativeMesh(state, mesh, [1, 1, 1], opacity);
    } else {
      const [nw, se] = source._tileCoordsToNwSe(tile.coords);
      mesh = quadNativeMesh(state, key, tile.el, boundsQuad(state, new L.LatLngBounds(nw, se)), opacity);
    }
    if (mesh) mesh.renderOrder += tile.coords.z / 100;
  }
}
