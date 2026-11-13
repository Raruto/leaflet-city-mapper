import { readCogDirectory } from './readCogDirectory.js';
import { readCogLevel } from './readCogLevel.js';

/**
 * Read TIFF image directories and register contiguous COG zoom levels.
 *
 * @param {Object} source Open COG byte source.
 * @param {number} offset First TIFF directory offset.
 *
 * @returns {Promise<Object>} Base image and minimum and maximum zoom.
 *
 * @throws {Error} If directories are cyclic or exceed the supported count.
 * @throws {Error} If there is no image directory.
 * @throws {Error} If overview zoom levels are not contiguous.
 */
export async function readCogDirectories(source, offset) {
  const state = /* alloc */ { base: null, minZoom: Infinity, maxZoom: -Infinity };
  const seen = /* alloc */ new Set();
  let directory;
  while (offset) {
    if (seen.has(offset) || seen.size >= 24) throw /* alloc */ new Error('Cyclic or excessive COG directories');
    seen.add(offset);
    directory = await readCogDirectory(source, offset);
    readCogLevel(source, directory, state);
    offset = directory.next;
  }
  if (!state.base) throw /* alloc */ new Error('COG has no image directory');
  if (source.levels.size !== state.maxZoom - state.minZoom + 1) {
    throw /* alloc */ new Error('COG overview zooms must be contiguous');
  }
  return /* alloc */ { base: state.base, minZoom: state.minZoom, maxZoom: state.maxZoom };
}
