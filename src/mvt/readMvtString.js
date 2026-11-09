import { mvtTextDecoder } from '../globals/mvtTextDecoder.js';
import { readMvtMessage } from './readMvtMessage.js';

export function readMvtString(reader, wire) {
  return mvtTextDecoder.decode(readMvtMessage(reader, wire).bytes);
}
