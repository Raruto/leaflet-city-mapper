/**
 * Check whether a non-range COG response has an unsupported status or declared size.
 *
 * @param {Response} response HTTP response.
 *
 * @returns {boolean} Whether the full response is unacceptable.
 */
export function invalidCogFullResponse(response) {
  return response.status !== 200 || Number(response.headers.get('Content-Length')) > 32000000;
}
