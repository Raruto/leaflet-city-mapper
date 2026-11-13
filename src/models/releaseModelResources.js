/**
 * Destroy geometry buffers and clear pipeline caches tracked by a model context.
 *
 * @param {Object} context Model context containing allocated resources.
 */
export function releaseModelResources(context) {
  let resource, attribute;
  for (resource of context.resources) {
    if (resource.attributes) {
      for (attribute of Object.values(resource.attributes)) attribute.buffer.destroy();
    } else {
      resource.pipelineCache.clear();
    }
  }
}
