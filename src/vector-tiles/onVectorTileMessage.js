export function onVectorTileMessage({ data }) {
  const pending = this.waiting.get(data.id);
  if (!pending) return;
  this.waiting.delete(data.id);
  if (data.error) pending.reject(/* alloc */ new Error(data.error));
  else pending.resolve(data);
}
