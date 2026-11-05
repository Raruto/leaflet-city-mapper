import { decodeDirectory } from "./decodeDirectory.js";
import { decompress } from "./decompress.js";
import { read } from "./read.js";

export async function loadDirectory(backend, offset, length, compression) {
  return decodeDirectory(await decompress(await read(backend, offset, length), compression));
}
