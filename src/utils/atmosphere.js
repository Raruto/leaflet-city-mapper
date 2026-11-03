
export function atmosphere(altitude) {
  if (!Number.isFinite(altitude)) throw new Error('Invalid solar altitude');
  const stops = [
    [-18, [3, 7, 20], [17, 28, 54], [0.025, 0.04, 0.09]],
    [-6, [37, 53, 84], [182, 106, 86], [0.12, 0.10, 0.14]],
    [0, [101, 131, 171], [246, 170, 115], [0.38, 0.24, 0.18]],
    [10, [74, 147, 208], [197, 221, 237], [0.80, 0.75, 0.68]],
    [25, [53, 144, 213], [223, 238, 250], [1, 1, 1]],
  ];
  const upper = stops.findIndex(stop => stop[0] >= altitude);
  const b = stops[upper < 0 ? stops.length - 1 : upper], a = stops[Math.max(0, upper - 1)];
  const t = a === b || upper < 0 ? 1 : (altitude - a[0]) / (b[0] - a[0]);
  const mix = index => a[index].map((value, i) => value + (b[index][i] - value) * t);
  const rgb = values => `rgb(${values.map(Math.round).join(', ')})`;
  return { background: `linear-gradient(${rgb(mix(1))}, ${rgb(mix(2))})`, tint: mix(3) };
}
