/**
 * Detect a tileJSON or templated tile URL when inline data is absent.
 *
 * @param {Object} options Source options.
 *
 * @returns {boolean} Whether the options identify a vector tile source.
 */
export function isVectorTileSource(options) {
  return options.data === undefined && (options.tileJSON !== undefined ||
    typeof options.url === 'string' && /\{[zxy]\}|%7B[zxy]%7D/i.test(options.url));
}
