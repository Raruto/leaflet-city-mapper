export function vertexCount(position, index) {
  return index?.count ?? index?.data.length ?? position.count ?? position.data.length / (position.size ?? 3);
}
