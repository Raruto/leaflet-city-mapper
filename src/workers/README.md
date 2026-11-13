# Workers

[Source guide](../README.md) | [Project README](../../README.md)

Coordinates the shared geometry worker pool and handles source tasks away from
the main thread, including model, COG, vector tile and area geometry work.

## Request and lifetime

```mermaid
flowchart LR
  Caller["Source request"] --> Acquire["Acquire worker for URL"]
  Acquire --> Dispatch{"geometryWorker message"}
  Dispatch -->|"model / cog / vector"| Handler["Source handler"]
  Dispatch -->|other| Geometry["Assemble area geometry"]
  Handler --> Outcome{"Job outcome"}
  Geometry --> Outcome
  Acquire -->|"abort / worker error"| Outcome
  Outcome -->|success| Pool["Return to map pool"]
  Outcome -->|"error / abort"| Close["Terminate worker"]
  Pool -->|"map unload"| Close
```

[runSourceWorker.js](./runSourceWorker.js) removes job listeners on completion.
Transferred buffers are no longer usable on the sending side. Callers must
check cancellation or session freshness before attaching results; vector tiles
also have their own [session lifecycle](../vector-tiles/README.md).

- [geometryWorker.js](./geometryWorker.js): dispatch worker requests.
- [runSourceWorker.js](./runSourceWorker.js): submit source work.
- [buildAreaInWorker.js](./buildAreaInWorker.js): build source area geometry.

Related: [sources](../sources/README.md), [models](../models/README.md), [cog](../cog/README.md), [vector-tiles](../vector-tiles/README.md).
