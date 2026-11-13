/**
 * Load the sprite index and derive the corresponding image URL.
 *
 * @param {string} url Sprite URL without extension.
 *
 * @returns {Promise<Object>} Sprite image URL and index.
 *
 * @throws {Error} If the sprite index request returns an unsuccessful status.
 */
export async function loadVectorSprite(url) {
  const response = await fetch(`${url}.json`);
  if (!response.ok) throw /* alloc */ new Error(`Sprite ${url}.json: HTTP ${response.status}`);
  return /* alloc */ { url: `${url}.png`, index: await response.json() };
}
