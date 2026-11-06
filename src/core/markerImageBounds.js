export function markerImageBounds(state, key, image) {
  const options = state.source.options.icon.options;
  const dimensions = options[key === 'shadow' ? 'shadowSize' : 'iconSize'];
  const bounds = state.markerImageBounds ||= /* alloc */ [0, 0, 0, 0];
  bounds[0] = dimensions ? dimensions.x ?? dimensions[0] : image.naturalWidth;
  bounds[1] = dimensions ? dimensions.y ?? dimensions[1] : image.naturalHeight;
  const anchor = (key === 'shadow' && options.shadowAnchor) || options.iconAnchor;
  bounds[2] = anchor ? anchor.x ?? anchor[0] : Math.floor(bounds[0] / 2);
  bounds[3] = anchor ? anchor.y ?? anchor[1] : Math.floor(bounds[1] / 2);
  return bounds;
}
