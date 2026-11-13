/**
 * Validate the optional roof and wall texture material settings.
 *
 * @param {Object} material Material containing texture settings.
 *
 * @throws {Error} If a texture setting is not a boolean or a finite number from 0 to 1.
 */
export function validateRoofMaterial(material) {
  let name, value;
  for (name of /* alloc */ ['roofTexture', 'wallTexture']) {
    value = material[name];
    if (value !== undefined && typeof value !== 'boolean' &&
      (!Number.isFinite(value) || value < 0 || value > 1)) {
      throw /* alloc */ new Error(`${name} must be a boolean or a finite number between 0 and 1`);
    }
  }
}
