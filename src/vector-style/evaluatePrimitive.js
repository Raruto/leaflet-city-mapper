export function evaluatePrimitive(op, args, properties, zoom) {
  switch (op) {
    case 'literal': return args[0];
    case 'get': return properties[args[0]];
    case 'has': return Object.hasOwn(properties, args[0]);
    case 'zoom': return zoom;
      default: throw /* alloc */ new Error(`Unsupported vector style expression: ${op}`);
  }
}
