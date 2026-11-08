export function settleGeometryWorker(task, event) {
  if (event.type === 'abort') task.reject(task.signal.reason);
  else if (event.type === 'error') task.reject(/* alloc */ new Error(`Geometry worker failed: ${event.message}`));
  else if (event.type === 'messageerror') task.reject(/* alloc */ new Error('Unable to receive geometry worker buffers'));
  else if (event.data.error) {
    const error = /* alloc */ new Error(event.data.error.message);
    error.name = event.data.error.name;
    task.reject(error);
  } else task.resolve(event.data);
}
