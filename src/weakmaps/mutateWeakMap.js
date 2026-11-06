export function mutateWeakMap(weakMap, key, operator, value, prefix = true) {
  const current = weakMap.get(key);
  if (operator === '++' || operator === '--') {
    const next = current + (operator === '++' ? 1 : -1);
    weakMap.set(key, next);
    return prefix ? next : current;
  }
  if (operator !== '=') throw /* alloc */ new Error('Unsupported WeakMap assignment: ' + operator);
  weakMap.set(key, value);
  return value;
}
