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
