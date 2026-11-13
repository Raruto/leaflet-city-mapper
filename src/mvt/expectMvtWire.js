/**
 * Validate the protobuf wire type for an MVT field.
 *
 * @param {number} wire Actual wire type.
 * @param {number} expected Expected wire type.
 *
 * @throws {Error} If the types differ.
 */
export function expectMvtWire(wire, expected) {
  if (wire !== expected) throw /* alloc */ new Error('Invalid MVT wire type');
}
