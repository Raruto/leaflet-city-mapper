/**
 * Fetch a glTF buffer into its binary property unless already loaded.
 *
 * @param {Object} buffer Buffer description and URI.
 * @param {string} directory Base URL for the buffer URI.
 *
 * @returns {Promise<void>} Completion of the buffer load.
 *
 * @throws {Error} If the buffer response is not successful.
 */
export async function loadBuffer(buffer, directory) {
  if (buffer.binary) return;
  const response = await fetch(/* alloc */ new URL(buffer.uri, directory).href);
  if (!response.ok) throw /* alloc */ new Error(`Unable to load model buffer: HTTP ${response.status}`);
  buffer.binary = await response.arrayBuffer();
}
