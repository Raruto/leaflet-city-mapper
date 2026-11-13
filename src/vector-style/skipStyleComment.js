/**
 * Find the end of a line or block comment in style source text.
 *
 * @param {string} text Style source.
 * @param {number} index Comment start index.
 * @param {string} marker Character after the initial slash.
 *
 * @returns {number} Index at the end of the comment.
 *
 * @throws {Error} If a block comment is unterminated.
 */
export function skipStyleComment(text, index, marker) {
  if (marker === '/') {
    while (index < text.length && text[index] !== '\n') index++;
    return index;
  }
  const end = text.indexOf('*/', index + 2);
  if (end < 0) throw /* alloc */ new Error('Unterminated style comment');
  return end + 1;
}
