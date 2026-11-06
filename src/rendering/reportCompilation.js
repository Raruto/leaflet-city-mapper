export async function reportCompilation(layer, pending) {
  let info, message;
  try {
    const infos = await Promise.all(pending);
    let errors = '', errorCount = 0;
    for (info of infos) {
      for (message of info.messages) if (message.type === 'error') errors += `${errorCount++ ? '\n' : ''}${message.message}`;
    }
    if (errorCount) {
      layer.fire('error', /* alloc */ {
        error: /* alloc */ new Error(`Unable to compile Layer3D WGSL: ${errors}`),
      });
    }
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
