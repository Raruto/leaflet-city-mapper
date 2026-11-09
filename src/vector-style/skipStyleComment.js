export function skipStyleComment(text, index, marker) {
  if (marker === '/') {
    while (index < text.length && text[index] !== '\n') index++;
    return index;
  }
  const end = text.indexOf('*/', index + 2);
  if (end < 0) throw /* alloc */ new Error('Unterminated style comment');
  return end + 1;
}
