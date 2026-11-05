export function destroyTrafficGpu(state) {
  state.gpu?.params?.destroy();
  state.gpu?.template?.destroy();
  state.gpu?.points?.destroy();
  state.gpu?.vehicles?.destroy();
  state.gpu = null;
}
