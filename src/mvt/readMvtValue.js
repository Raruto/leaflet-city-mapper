import { readMvtField } from './readMvtField.js';
import { skipMvtField } from './skipMvtField.js';
import { readMvtKnownValue } from './readMvtKnownValue.js';

export function readMvtValue(reader) {
  let value, found = false, field, wire;
  while (reader.pos < reader.bytes.length) {
    [field, wire] = readMvtField(reader);
    if (field < 1 || field > 7) {
      skipMvtField(reader, wire);
      continue;
    }
    if (found) throw /* alloc */ new Error('Multiple MVT value types');
    found = true;
    value = readMvtKnownValue(reader, field, wire);
  }
  if (!found) throw /* alloc */ new Error('Empty MVT value');
  return value;
}
