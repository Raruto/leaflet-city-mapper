export function readBridges(response) {
  if (!response.ok) throw new Error(`Bridges: HTTP ${response.status}`);
  return response.json();
}
