export function expectMvtWire(wire, expected) {
  if (wire !== expected) throw /* alloc */ new Error('Invalid MVT wire type');
}
