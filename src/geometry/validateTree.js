export function validateTree(trunkRadius, crownRadius, crownBottom, bottom, top, crownShape) {
  if (!Number.isFinite(trunkRadius) || !Number.isFinite(crownRadius) || !Number.isFinite(crownBottom) ||
    trunkRadius <= 0 || crownRadius < trunkRadius || crownBottom <= bottom || crownBottom >= top ||
    crownShape !== 'round' && crownShape !== 'cone') {
    throw /* alloc */ new Error('Invalid tree dimensions or crown shape');
  }
}
