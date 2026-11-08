import { settleGeometryWorker } from './settleGeometryWorker.js';

export function startGeometryWorker(task, resolve, reject) {
  task.resolve = resolve;
  task.reject = reject;
  task.onEvent = settleGeometryWorker.bind(null, task);
  task.worker.addEventListener('message', task.onEvent);
  task.worker.addEventListener('error', task.onEvent);
  task.worker.addEventListener('messageerror', task.onEvent);
  task.signal.addEventListener('abort', task.onEvent, /* alloc */ { once: true });
  if (task.signal.aborted) {
    reject(task.signal.reason);
    return;
  }
  task.worker.postMessage(task.input);
}
