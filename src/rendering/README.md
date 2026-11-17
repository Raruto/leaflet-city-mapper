# Rendering

[Source guide](../README.md) | [Project README](../../README.md)

Owns mesh lifecycle and the shared renderer's frame stages: camera updates,
mesh collection, uniforms, shadows, drawing and GPU submission.

## One frame

```mermaid
flowchart LR
  Frame["Scheduled frame"] --> View["Resize + zoom + camera"]
  View --> World["World matrices + native sync"]
  World --> Collect["Collect meshes + roof atlas"]
  Collect --> Prepare["Prepare meshes + uniforms"]
  Prepare --> Shadow["Shadow pass"]
  Shadow --> Draw["Scene pass"]
  Draw --> Submit["Submit GPU commands"]
  Submit --> Prune["Prune raster / schedule next frame"]
```

Only the shared owner renders. [drawSceneMeshes.js](./drawSceneMeshes.js)
selects winding from the world transform, rejects singular transforms and
draws double-sided transparent non-native meshes in two passes. Buffers,
programs and textures have different lifetimes; see
[disposeMesh.js](./disposeMesh.js) and [textures](../textures/README.md).

The scene uses reversed-Z floating-point depth; pipeline comparison and depth
clearing must match the [camera projection](../camera/README.md). Culling keeps
the same clip volume. Sorting negates projected depth so existing front-to-back
and transparent back-to-front ordering is preserved. Shadow depth is independent.
Pipeline caches include the optional mesh slope bias; only native paths set it.

- [render.js](./render.js): orchestrate a frame.
- [createMesh.js](./createMesh.js) and [disposeMesh.js](./disposeMesh.js): manage mesh resources.
- [drawSceneMeshes.js](./drawSceneMeshes.js): issue scene draw commands.

Related: [gpu](../gpu/README.md), [materials](../materials/README.md), [shadows](../shadows/README.md).
