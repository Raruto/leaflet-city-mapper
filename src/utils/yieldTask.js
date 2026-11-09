export function yieldTask(delay = 0) {
  const task = Promise.withResolvers();
  setTimeout(task.resolve, delay);
  return task.promise;
}
