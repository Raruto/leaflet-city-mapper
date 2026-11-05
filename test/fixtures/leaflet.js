globalThis.L = {};

export function mockLeaflet(members) {
  const previous = { ...globalThis.L };
  for (const key of Object.keys(globalThis.L)) delete globalThis.L[key];
  Object.assign(globalThis.L, members);
  return previous;
}
