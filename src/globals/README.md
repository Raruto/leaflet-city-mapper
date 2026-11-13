# Shared globals

[Source guide](../README.md) | [Project README](../../README.md)

Holds shared constants, reusable buffers and descriptors, queues and mutable
holders. Each module owns a single shared binding; callers should respect whether
its contents are reusable mutable scratch state or an immutable constant.

## Shared is not per-layer

```mermaid
flowchart LR
  Globals["Shared module bindings"] --> Constants["Constants / saved methods"]
  Globals --> Scratch["Reusable arrays / descriptors"]
  Globals --> Queues["Shared queues / mutable holders"]
  Queues --> Frames["Coalesced scene frames"]
  Objects["Map / layer / mesh"] --> WeakMaps["Per-object WeakMaps"]
```

Scratch values are reused: do not retain them as private layer state. Clear
temporary resource references as existing consumers do. Per-object lifetime
belongs in [weakmaps](../weakmaps/README.md).

- [L.js](./L.js): host Leaflet namespace.
- [geometryWorkerUrl.js](./geometryWorkerUrl.js): default worker URL.
- [pendingUpdates.js](./pendingUpdates.js): queued scene updates.

Related: [weakmaps](../weakmaps/README.md), [scene](../scene/README.md).
