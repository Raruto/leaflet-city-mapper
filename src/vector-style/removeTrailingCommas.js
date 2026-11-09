export function removeTrailingCommas(json) {
  let cleaned = '', quoted = false, escaped = false, i = 0, char = '';
  for (i = 0; i < json.length; i++) {
    char = json[i];
    if (!quoted && char === ',' && /^\s*[\]}]/.test(json.slice(i + 1))) continue;
    cleaned += char;
    if (escaped) escaped = false;
    else if (quoted && char === '\\') escaped = true;
    else if (char === '"') quoted = !quoted;
  }
  return cleaned;
}
