# Distribution bundles

[Project README](../README.md) | [Build guide](../build/README.md) | [Source guide](../src/README.md)

```mermaid
flowchart LR
  Source["src/index.js"] --> Build["npm run build"]
  Worker["src/workers/geometryWorker.js"] --> Build
  Build --> Main["Main bundle: minified + source"]
  Build --> WorkerBundle["Worker bundle: minified + source"]
  Build --> Maps["Source maps"]
  Main --> Browser["Leaflet application"]
  WorkerBundle --> Browser
```

These are tracked build outputs, not the source of truth. Edit [src](../src/README.md)
and regenerate with [build.js](../build/build.js), rather than hand-editing
bundles. The main entry is configured in [package.json](../package.json).
