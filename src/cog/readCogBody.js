export async function readCogBody(response, length) {
  const reader = response.body.getReader(), chunks = /* alloc */ [];
  let total = 0, part;
  try {
    while (!(part = await reader.read()).done) {
      total += part.value.byteLength;
      if (total > (response.status === 206 ? length : 32000000)) {
        await reader.cancel();
        throw /* alloc */ new Error('Oversized COG response');
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = /* alloc */ new Uint8Array(total);
  let start = 0, chunk;
  for (chunk of chunks) { data.set(chunk, start); start += chunk.length; }
  return data;
}
