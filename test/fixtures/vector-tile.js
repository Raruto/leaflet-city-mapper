export function varint(value) {
  value = BigInt.asUintN(64, BigInt(value));
  const bytes = [];
  do {
    const byte = Number(value & 127n);
    value >>= 7n;
    bytes.push(byte | (value ? 128 : 0));
  } while (value);
  return bytes;
}

export function field(number, wire, bytes) {
  return [...varint(number * 8 + wire), ...(wire === 2 ? varint(bytes.length) : []), ...bytes];
}

export function feature(type, geometry, tags = [], id = 1) {
  return [
    ...field(1, 0, varint(id)),
    ...field(2, 2, tags.flatMap(varint)),
    ...field(3, 0, varint(type)),
    ...field(4, 2, geometry.flatMap(varint)),
  ];
}

export function tile(features, keys = [], values = [], name = 'test') {
  return new Uint8Array(field(3, 2, [
    ...field(15, 0, varint(2)),
    ...field(1, 2, [...new TextEncoder().encode(name)]),
    // Feature records intentionally precede the property tables.
    ...features.flatMap(bytes => field(2, 2, bytes)),
    ...keys.flatMap(key => field(3, 2, [...new TextEncoder().encode(key)])),
    ...values.flatMap(value => field(4, 2, value)),
    ...field(5, 0, varint(4096)),
    ...field(20, 0, varint(123)),
    ...field(21, 1, Array(8).fill(0)),
    ...field(22, 2, [1, 2, 3]),
    ...field(23, 5, Array(4).fill(0)),
  ]));
}
