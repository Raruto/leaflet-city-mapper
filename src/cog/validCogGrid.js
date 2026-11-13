/**
 * Check that a COG level aligns with the supported Web Mercator XYZ grid.
 *
 * @param {Object} source COG source and existing levels.
 * @param {Object} base Base image profile and georeferencing.
 * @param {Object} profile Level dimensions and elevation flag.
 * @param {number} zoom Derived XYZ zoom.
 * @param {number} x Level's XYZ column origin.
 * @param {number} y Level's XYZ row origin.
 * @param {number} resolution Level resolution.
 *
 * @returns {boolean} Whether the level is supported and grid-aligned.
 */
export function validCogGrid(source, base, profile, zoom, x, y, resolution) {
  return zoom >= 0 && zoom <= 24 &&
    Math.abs(20037508.342789244 * 2 / (256 * 2 ** zoom) - resolution) <= resolution * 1e-7 &&
    (!profile.elevation || Number.isInteger(x) && Number.isInteger(y)) &&
    Math.abs(base.width / profile.width - base.height / profile.height) <= 1e-7 &&
    profile.elevation === base.elevation &&
    x >= 0 && y >= 0 && x + profile.width / 256 <= 2 ** zoom && y + profile.height / 256 <= 2 ** zoom &&
    !source.levels.has(zoom) && !(base.elevation && source.levels.size);
}
