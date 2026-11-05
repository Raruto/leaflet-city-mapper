import { pendingUpdates } from '../constants/pendingUpdates.js';

export function cancelUpdate(backend) {
  const frame = backend._frame;
  pendingUpdates.delete(backend);
  backend._frame = null;
  if (!pendingUpdates.size && frame != null) {
    cancelAnimationFrame(frame);
  }
}
