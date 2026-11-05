export async function loadCameraControls(map) {
  try {
    const { cameraControls } = await import('./cameraControls.js');
    if (map._container?._leaflet_id) cameraControls(map);
  } catch (error) {
    map.fire('error', /* alloc */ { error });
    throw error;
  }
}
