import { directoriesByLayer } from '../weakmaps/directoriesByLayer.js';

import { loadDirectory } from './loadDirectory.js';

export async function getDirectoryEntries(layer, offset, length, compression) {
  const directories = directoriesByLayer.get(layer);
  const key = `${offset}:${length}`;
  if (!directories.has(key)) {
    if (directories.size >= 32) directories.delete(directories.keys().next().value);
    directories.set(key, loadDirectory(layer, offset, length, compression));
  }
  const pending = directories.get(key);
  try {
    return await pending;
  } catch (error) {
    if (directories.get(key) === pending) directories.delete(key);
    throw error;
  }
}
