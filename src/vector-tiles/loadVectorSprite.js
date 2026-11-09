export async function loadVectorSprite(url) {
  const response = await fetch(`${url}.json`);
  if (!response.ok) throw /* alloc */ new Error(`Sprite ${url}.json: HTTP ${response.status}`);
  return /* alloc */ { url: `${url}.png`, index: await response.json() };
}
