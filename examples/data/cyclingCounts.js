/** Place measured counter flows on the nearest recorded path, never extrapolate to unmeasured paths. */
export function cyclingCounts(paths, counts, counted) {
  const features = [], matched = new Map(), unmatched = [];
  for (const counter of counts) {
    if (!Number.isFinite(counter.sum_counts) || counter.sum_counts < 0 ||
      !Number.isFinite(counter.coordinates?.lon) || !Number.isFinite(counter.coordinates?.lat)) {
      throw new Error('Invalid cycling counter');
    }
    let best = -1, distance = 50;
    for (let i = 0; i < paths.features.length; i++) {
      const line = paths.features[i].geometry.coordinates;
      for (let j = 1; j < line.length; j++) {
        const d = counterDistance(counter.coordinates, line[j - 1], line[j]);
        if (d < distance) { best = i; distance = d; }
      }
    }
    if (best < 0) { unmatched.push(counter.id_compteur); continue; }
    if (!matched.has(best)) matched.set(best, []);
    matched.get(best).push(counter);
  }
  for (const [index, counters] of matched) {
    const path = paths.features[index], flow = counters.reduce(sumCounts, 0);
    features.push({ ...path, properties: { ...path.properties, flow,
      countedAt: counted, counters: counters.map(counterId),
      description: `${flow} bicycles/hour measured at ${counted}.\n` +
        'Counter mapped to the nearest recorded cycling path within 50 m.\nIllustrative positions, not live GPS; no extrapolation to other paths.',
    } });
  }
  return { ...paths, hour: counted, features,
    note: `bicycles: measured counts ${counted}; ${unmatched.length} unmatched counters; unmeasured paths not animated, not live GPS` };
}

function sumCounts(total, counter) {
  return total + counter.sum_counts;
}

function counterId(counter) {
  return counter.id_compteur;
}

function counterDistance(point, a, b) {
  const scale = 111195 * Math.cos(point.lat * Math.PI / 180);
  const ax = (a[0] - point.lon) * scale, ay = (a[1] - point.lat) * 111195;
  const dx = (b[0] - a[0]) * scale, dy = (b[1] - a[1]) * 111195;
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(ax + t * dx, ay + t * dy);
}
