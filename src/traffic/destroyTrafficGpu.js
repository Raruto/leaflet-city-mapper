export function destroyTrafficGpu(state) {
  let buffer;
  for (buffer of [state.gpu?.params, state.gpu?.template, state.gpu?.points, state.gpu?.vehicles]) buffer?.destroy();
  state.gpu = null;
}
