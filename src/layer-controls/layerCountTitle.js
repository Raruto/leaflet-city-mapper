export function layerCountTitle(scene, formatted, pending, error) {
  return error ? `Unable to load: ${typeof error === 'string' ? error : error.message}` :
    `${formatted} loaded ${scene.modelUrl ? 'models' : 'elements'} in the current area${pending ? `; ${pending} blocks loading` : ''}`;
}
