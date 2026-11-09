export function appendQuotedStyleCharacter(char, state) {
  if (state.quoted) {
    if (state.escaped) {
      state.escaped = false;
      return char === "'" ? char : '\\' + char;
    }
    if (char === '\\') {
      state.escaped = true;
      return '';
    }
    if (char === state.quoted) {
      state.quoted = '';
      return '"';
    }
    return char === '"' ? '\\"' : char;
  }
  if (char === '"' || char === "'") {
    state.quoted = char;
    return '"';
  }
  return undefined;
}
