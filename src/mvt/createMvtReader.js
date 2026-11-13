/**
 * Create a protobuf reader over the supplied tile bytes.
 *
 * @param {Uint8Array} bytes Input bytes.
 *
 * @returns {Object} Reader with a data view and cursor.
 */
export function createMvtReader(bytes) {
  return /* alloc */ {
    bytes,
    view: /* alloc */ new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    pos: 0,
  };
}
