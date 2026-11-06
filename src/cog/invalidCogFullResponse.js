export function invalidCogFullResponse(response) {
  return response.status !== 200 || Number(response.headers.get('Content-Length')) > 32000000;
}
