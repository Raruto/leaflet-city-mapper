export function isVectorTileSource(options) {
  return options.data === undefined && (options.tileJSON !== undefined ||
    typeof options.url === 'string' && /\{[zxy]\}|%7B[zxy]%7D/i.test(options.url));
}
