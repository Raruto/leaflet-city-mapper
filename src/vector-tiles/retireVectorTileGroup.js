import { yieldTask } from '../utils/yieldTask.js';

/**
 * Remove a tile group's layers incrementally while its session remains current.
 *
 * @param {Object} group Leaflet layer group to retire.
 *
 * @returns {Promise<void>} Completion of retirement.
 */
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
