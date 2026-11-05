export async function reportCompilation(backend, pending) {
  let info, message;
  try {
    const infos = await Promise.all(pending);
    const errors = [];
    for (info of infos) {
      for (message of info.messages) if (message.type === 'error') errors.push(message.message);
    }
    if (errors.length) {
      backend.fire('error', {
        error: new Error(`Unable to compile Layer3D WGSL: ${errors.join('\n')}`),
      });
    }
  } catch (error) {
    backend.fire('error', { error });
  }
}
