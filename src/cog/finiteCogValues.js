export function finiteCogValues(values) {
  let value;
  for (value of values || /* alloc */ []) if (!Number.isFinite(value)) return false;
  return true;
}
