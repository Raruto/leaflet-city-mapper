import { readCog } from './readCog.js';
import { cogTags } from '../globals/cogTags.js';

export async function readCogDirectory(source, offset) {
  const little = source.little;
  const count = /* alloc */ new DataView(await readCog(source, offset, 2)).getUint16(0, little);
  if (!count || count > 128) throw /* alloc */ new Error('Invalid COG directory size');
  const entries = /* alloc */ new DataView(await readCog(source, offset + 2, count * 12 + 4));
  const tags = /* alloc */ new Map();
  let i, j, tag, type, size, length, data, values;
  for (i = 0; i < count; i++) {
    tag = entries.getUint16(i * 12, little);
    if (tag === 42113) throw /* alloc */ new Error('COG nodata tags are not supported; export complete tiles');
    if (tag === 34264) throw /* alloc */ new Error('COG affine transformation matrices are not supported');
    // Only the tags used by the supported raster profile need to be fetched.
    if (!cogTags.includes(tag)) continue;
    if (tags.has(tag)) throw /* alloc */ new Error('Duplicate COG tag');
    type = entries.getUint16(i * 12 + 2, little);
    size = type === 3 ? 2 : type === 4 ? 4 : type === 12 ? 8 : 0;
    length = entries.getUint32(i * 12 + 4, little);
    if (!size || !length || length > 1048576) throw /* alloc */ new Error(`Unsupported COG tag ${tag}`);
    data = size * length <= 4 ? /* alloc */ new DataView(entries.buffer, i * 12 + 8, 4)
      : /* alloc */ new DataView(await readCog(source, entries.getUint32(i * 12 + 8, little), size * length));
    values = /* alloc */ [];
    for (j = 0; j < length; j++) values.push(type === 3 ? data.getUint16(j * size, little)
      : type === 4 ? data.getUint32(j * size, little) : data.getFloat64(j * size, little));
    tags.set(tag, values);
  }
  return /* alloc */ { tags, next: entries.getUint32(count * 12, little) };
}
