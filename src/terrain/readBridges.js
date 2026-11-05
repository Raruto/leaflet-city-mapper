export function readBridges(response) {
  if (!response.ok) throw /* alloc */ new Error(`Bridges: HTTP ${response.status}`);
  return response.json();
}
