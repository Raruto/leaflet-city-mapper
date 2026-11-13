/**
 * Validate tree radii, crown height and crown shape.
 *
 * @param {number} trunkRadius Trunk radius.
 * @param {number} crownRadius Crown radius.
 * @param {number} crownBottom Height where the crown begins.
 * @param {number} bottom Tree bottom height.
 * @param {number} top Tree top height.
 * @param {string} crownShape Crown shape.
 *
 * @throws {Error} If dimensions or crown shape are invalid.
 */
export function validateTree(trunkRadius, crownRadius, crownBottom, bottom, top, crownShape) {
  if (!Number.isFinite(trunkRadius) || !Number.isFinite(crownRadius) || !Number.isFinite(crownBottom) ||
    trunkRadius <= 0 || crownRadius < trunkRadius || crownBottom <= bottom || crownBottom >= top ||
    crownShape !== 'round' && crownShape !== 'cone') {
    throw /* alloc */ new Error('Invalid tree dimensions or crown shape');
  }
}
