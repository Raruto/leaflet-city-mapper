import { expectMvtWire } from './expectMvtWire.js';
import { readMvtInteger } from './readMvtInteger.js';
import { readMvtNumber } from './readMvtNumber.js';
import { takeMvtBytes } from './takeMvtBytes.js';

export function skipMvtField(reader, wire) {
  switch (wire) {
    case 0: readMvtInteger(reader); break;
    case 1: takeMvtBytes(reader, 8); break;
    case 2: takeMvtBytes(reader, readMvtNumber(reader)); break;
    case 5: takeMvtBytes(reader, 4); break;
    default: throw /* alloc */ new Error('Unsupported MVT wire type');
  }
}
