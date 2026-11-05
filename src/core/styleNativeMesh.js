import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


export function styleNativeMesh(state, mesh, color, opacity) {
  const { source, marker, paneOrder, order } = state;
  mesh.program.uniforms.baseColor.value = color;
  mesh.program.uniforms.opacity.value = opacity;
  if (source instanceof L.GridLayer) mesh.opacity = opacity;
  const zIndex = marker ? source._zIndex + (sceneByLayer.get(source)._cameraZIndexOffset || 0) : source.options.zIndex;
  mesh.renderOrder = paneOrder * 1e6 + (zIndex || 0) * 1000 + order;
  mesh._nativeSource = source;
  mesh._nativeUsed = true;
}
