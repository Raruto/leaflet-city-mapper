/**
 * Strict UTF-8 decoder used for vector tile strings.
 *
 * @type {TextDecoder}
 */
export const mvtTextDecoder = new TextDecoder('utf-8', { fatal: true });
