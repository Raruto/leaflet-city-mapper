import { appendQuotedStyleCharacter } from './appendQuotedStyleCharacter.js';
import { skipStyleComment } from './skipStyleComment.js';

/**
 * Strip style comments and normalize quoted strings to JSON form.
 *
 * @param {string} text Style source text.
 *
 * @returns {string} Comment-free JSON-like text.
 */
export function stripStyleComments(text) {
  let json = '', i = 0, char = '', next = '', converted = undefined;
  const state = /* alloc */ { quoted: '', escaped: false };
  for (i = 0; i < text.length; i++) {
    char = text[i];
    next = text[i + 1];
    converted = appendQuotedStyleCharacter(char, state);
    if (converted !== undefined) {
      json += converted;
      continue;
    }
    if (char === '/' && (next === '/' || next === '*')) {
      i = skipStyleComment(text, i, next);
      json += next === '/' ? '\n' : ' ';
    } else json += char;
  }
  return json;
}
