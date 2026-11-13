/**
 * Load and initialize camera controls for a map that is still mounted.
 *
 * @param {L.Map} map Map receiving the controls.
 *
 * @returns {Promise<void>} Completion of control loading.
 *
 * @throws {Error} If loading or initialization fails, after emitting a map error.
 */
export async function loadCameraControls(map) {
  try {
    const { cameraControls } = await import('./cameraControls.js');
    if (map._container?._leaflet_id) cameraControls(map);
  } catch (error) {
    map.fire('error', /* alloc */ { error });
    throw error;
  }
}
