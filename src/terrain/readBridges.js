export function readBridges(response) {
  if (!response.ok) throw /* allocation: required -- Each reported failure needs its own message and stack for the receiving caller or event listener. */ new Error(`Bridges: HTTP ${response.status}`);
  return response.json();
}
