import { yieldTask } from '../utils/yieldTask.js';

export async function retireVectorTileGroup(group) {
  const session = this.session;
  this.retiring.add(group);
  let removed = 0, layer;
  for (layer of group.getLayers()) {
    if (this.session !== session) return;
    group.removeLayer(layer);
    if (++removed % 8 === 0) await yieldTask();
  }
  group.remove(); this.retiring.delete(group);
}
