export function destroyTrafficGpu(state) {
  for (const buffer of [state.gpu?.params, state.gpu?.template, state.gpu?.points, state.gpu?.vehicles]) buffer?.destroy();
  state.gpu = null;
}
