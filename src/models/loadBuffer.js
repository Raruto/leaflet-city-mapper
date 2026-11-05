export async function loadBuffer(buffer, directory) {
  if (buffer.binary) return;
  const response = await fetch(/* allocation: required -- URL resolution is bound to this concurrent model buffer request. */ new URL(buffer.uri, directory).href);
  if (!response.ok) throw /* allocation: required -- Failed requests retain their own HTTP error and stack. */ new Error(`Unable to load model buffer: HTTP ${response.status}`);
  buffer.binary = await response.arrayBuffer();
}
