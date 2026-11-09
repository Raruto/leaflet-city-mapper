export function createMvtReader(bytes) {
  return /* alloc */ {
    bytes,
    view: /* alloc */ new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    pos: 0,
  };
}
