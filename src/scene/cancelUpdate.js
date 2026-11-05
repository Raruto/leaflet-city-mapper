import { sceneByLayer } from '../globals/sceneByLayer.js';
import { pendingUpdates } from '../globals/pendingUpdates.js';



export function cancelUpdate(backend) {
  const frame = sceneByLayer.get(backend)._frame;
  pendingUpdates.delete(backend);
  sceneByLayer.get(backend)._frame = null;
  if (!pendingUpdates.size && frame != null) {
    cancelAnimationFrame(frame);
  }
}
