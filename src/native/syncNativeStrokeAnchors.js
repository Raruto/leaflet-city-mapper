export function syncNativeStrokeAnchors(state, stroke) {
  const { source } = state;
  if (state.strokeAnchors?.length === stroke.length && stroke.length) {
    if (source.options.interactive === false) state.strokeCoordinates = stroke;
    else {
      state.strokeCoordinates = /* alloc */ new Float64Array(stroke);
      state.strokeAnchors = /* alloc */ new Float64Array(state.strokeAnchors);
    }
    state.strokeZoom = state.map.getZoom();
    state.strokeWeight = Number(source.options.weight);
  } else state.strokeAnchors = null;
}
