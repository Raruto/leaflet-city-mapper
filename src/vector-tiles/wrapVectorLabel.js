/** Greedy word wrap at 10 ems (MapLibre's default text-max-width), estimating glyph width at 0.52 em. */
export function wrapVectorLabel(text) {
  const limit = Math.floor(10 / 0.52), lines = /* alloc */ [];
  let line = '', word;
  for (word of text.split(' ')) {
    if (line && Array.from(`${line} ${word}`).length > limit) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  lines.push(line);
  return lines;
}
