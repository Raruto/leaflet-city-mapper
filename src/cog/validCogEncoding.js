export function validCogEncoding(tags, samples, bits, format, elevation, bytes, unsigned) {
  if (elevation) return tags.get(262)?.[0] === 1;
  return (samples === 3 || samples === 4) && bits?.length === samples && bytes && unsigned &&
    tags.get(262)?.[0] === 2;
}
