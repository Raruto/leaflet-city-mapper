import { localPosition } from '../projections/localPosition.js';

export function boundsQuad(state, bounds) {
  const positions = /* alloc */ [];
  let i, corner;
  for (i = 0; i < 4; i++) {
    corner = i === 0 ? bounds.getNorthWest() : i === 1 ? bounds.getNorthEast()
      : i === 2 ? bounds.getSouthWest() : bounds.getSouthEast();
    positions.push(localPosition(state, corner));
  }
  return positions;
}
