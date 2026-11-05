import { localPosition } from './localPosition.js';

export function boundsQuad(state, bounds) {
  const corners = [
    bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthWest(), bounds.getSouthEast(),
  ];
  const positions = [];
  for (const corner of corners) positions.push(localPosition(state, corner));
  return positions;
}
