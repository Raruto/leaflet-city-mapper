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
