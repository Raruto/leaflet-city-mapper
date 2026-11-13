# Scene and layer lifecycle

[Source guide](../README.md) | [Project README](../../README.md)

Routes layer source options to their implementations and manages attachment,
shared renderer ownership, updates and scene graph nodes.

## Layer lifecycle

```mermaid
flowchart TD
  Layer["new L.Layer with source"] --> Route["layerInitialize"]
  Route -->|"vector"| Vector{"Source shape"}
  Vector --> Tiles["Vector tiles"]
  Vector --> GeoJSON["GeoJSON"]
  Vector --> ThreeD["3D / model"]
  Route -->|"other types"| Init["initializerFor: raster / terrain / traffic"]
  GeoJSON --> Ready["3D readiness + root"]
  ThreeD --> Ready
  Ready --> Attach["Attach to shared scene"]
  Attach --> Update["Schedule frame"]
  Attach --> Remove{"Remove layer"}
  Remove -->|"owner with members"| Transfer["Transfer ownership"]
  Remove -->|"last owner"| Release["Release renderer"]
  Remove -->|"non-owner"| Detach["Detach root"]
```

Source settings are flattened; omitted types are inferred as described in
[index.js](../index.js). Addition and readiness may occur in either order.
The [removal path](./onRemove3DLayer.js) cancels areas before detaching.

- [layerInitialize.js](./layerInitialize.js): choose vector handling or queue other source types.
- [initializerFor.js](./initializerFor.js): select raster, terrain or traffic initialization.
- [attachSharedScene.js](./attachSharedScene.js): attach a layer to a shared scene.

Related: [sources](../sources/README.md), [gpu](../gpu/README.md), [weakmaps](../weakmaps/README.md).
