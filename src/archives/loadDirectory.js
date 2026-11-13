import { decodeDirectory } from "./decodeDirectory.js";
import { decompress } from "./decompress.js";
import { read } from "./readArchiveRange.js";

/**
 * Read, decompress and decode an archive directory.
 *
 * @param {L.Layer} layer Archive layer.
 * @param {number} offset Directory byte offset.
 * @param {number} length Directory byte length.
 * @param {number} compression PMTiles compression code.
 *
 * @returns {Promise<Object[]>} Decoded directory entries.
 */
export async function loadDirectory(layer, offset, length, compression) {
  return decodeDirectory(await decompress(await read(layer, offset, length), compression));
}
