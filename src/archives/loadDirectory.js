import { decodeDirectory } from "./decodeDirectory.js";
import { decompress } from "./decompress.js";
import { read } from "./read.js";

export async function loadDirectory(layer, offset, length, compression) {
  return decodeDirectory(await decompress(await read(layer, offset, length), compression));
}
