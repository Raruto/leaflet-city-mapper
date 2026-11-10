// Retained entries stay unchanged, including whether the example initially adds them.
export function focusParisLayers(html, retainedNames) {
  const retained = new Set(retainedNames);
  return html.replace(/^(\t{4}'([^']+)':)[\s\S]*?(?=^\t{4}'|^\t{3}\},)/gm,
    (entry, label, name) => retained.has(name) ? entry : `${label} new L.LayerGroup(),\n`);
}
