import { readCog } from './readCog.js';
import { cogTags } from '../globals/cogTags.js';
import { readCogTag } from './readCogTag.js';

/**
 * Read supported TIFF tags from one image directory.
 *
 * @param {Object} source Open COG byte source.
 * @param {number} offset Directory byte offset.
 *
 * @returns {Promise<Object>} Tag map and next directory offset.
 *
 * @throws {Error} If the directory size is invalid.
 * @throws {Error} If a nodata tag is present.
 * @throws {Error} If an affine transformation tag is present.
 * @throws {Error} If a supported tag is duplicated.
 */
export async function readCogDirectory(source, offset) {
  const little = source.little;
  const count = /* alloc */ new DataView(await readCog(source, offset, 2)).getUint16(0, little);
  if (!count || count > 128) throw /* alloc */ new Error('Invalid COG directory size');
  const entries = /* alloc */ new DataView(await readCog(source, offset + 2, count * 12 + 4));
  const tags = /* alloc */ new Map();
  let i, tag;
  for (i = 0; i < count; i++) {
    tag = entries.getUint16(i * 12, little);
    if (tag === 42113) throw /* alloc */ new Error('COG nodata tags are not supported; export complete tiles');
    if (tag === 34264) throw /* alloc */ new Error('COG affine transformation matrices are not supported');
    if (!cogTags.includes(tag)) continue;
    if (tags.has(tag)) throw /* alloc */ new Error('Duplicate COG tag');
    tags.set(tag, await readCogTag(source, entries, i, tag, little));
  }
  return /* alloc */ { tags, next: entries.getUint32(count * 12, little) };
}
