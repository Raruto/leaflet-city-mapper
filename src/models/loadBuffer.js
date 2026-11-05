export async function loadBuffer(buffer, directory) {
  if (buffer.binary) return;
  const response = await fetch(/* alloc */ new URL(buffer.uri, directory).href);
  if (!response.ok) throw /* alloc */ new Error(`Unable to load model buffer: HTTP ${response.status}`);
  buffer.binary = await response.arrayBuffer();
}
