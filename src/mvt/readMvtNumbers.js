import { readMvtMessage } from './readMvtMessage.js';
import { readMvtNumber } from './readMvtNumber.js';

export function readMvtNumbers(reader, wire, target) {
  let packed;
  if (wire === 0) target.push(readMvtNumber(reader));
  else {
    packed = readMvtMessage(reader, wire);
    while (packed.pos < packed.bytes.length) target.push(readMvtNumber(packed));
  }
}
