# Vehicle models

[Source guide](../README.md) | [Project README](../../README.md)

Creates procedural vehicle and pedestrian parts for traffic. Walking uses
shared pedestrian body parts rather than the traffic model itself.

## Shapes versus movement

```mermaid
flowchart LR
  Shared["Shared pedestrian body parts"] --> Shapes["Vehicle / pedestrian models"]
  Shared --> WalkerParts["Walker limbs"]
  Shapes --> TrafficBuild["Build traffic geometry"]
  WalkerParts --> WalkBuild["Build walker geometry"]
  TrafficBuild --> Traffic["Traffic: lanes + GPU poses"]
  WalkBuild --> Walk["Walk: pedestrian animation"]
```

These are shapes, not animated layers. Shared-part changes affect both
consumers; changes here do not alter traffic routing or walker movement.

- [carModel.js](./carModel.js): construct car parts.
- [pedestrianModel.js](./pedestrianModel.js): construct pedestrian parts.
- [bicycleModel.js](./bicycleModel.js): construct bicycle parts.

Related: [traffic](../traffic/README.md), [walk](../walk/README.md), [geometry](../geometry/README.md).
