import { createMvtReader } from './createMvtReader.js';
import { expectMvtWire } from './expectMvtWire.js';
import { readMvtNumber } from './readMvtNumber.js';
import { takeMvtBytes } from './takeMvtBytes.js';

export function readMvtMessage(reader, wire) {
  expectMvtWire(wire, 2);
  const size = readMvtNumber(reader), start = takeMvtBytes(reader, size);
  return createMvtReader(reader.bytes.subarray(start, start + size));
}
