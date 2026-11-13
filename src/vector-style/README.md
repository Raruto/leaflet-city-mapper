# Vector styles

[Source guide](../README.md) | [Project README](../../README.md)

Parses and validates vector style layers, evaluates supported expressions and
translates paint values for vector tile rendering.

## Style input and evaluation

```mermaid
flowchart LR
  Text["JSON / otm_layers text"] --> Clean["Remove comments + trailing commas"]
  Clean --> Parse["JSON parse + validate layers"]
  Parse --> Match["Match style and source layers"]
  Match --> Evaluate["Evaluate expressions: properties + zoom"]
  Evaluate --> Paint["Resolve fill / line paint"]
  Paint --> Tile["Vector tile presentation"]
```

Parsing does not execute arbitrary JavaScript. Only supported expression
operators are evaluated; non-array values pass through unchanged.

- [parseVectorStyle.js](./parseVectorStyle.js): parse and validate style source.
- [evaluateStyle.js](./evaluateStyle.js): evaluate style expressions.
- [vectorPaint.js](./vectorPaint.js): derive paint values.

Related: [vector-tiles](../vector-tiles/README.md), [colors](../colors/README.md), [mvt](../mvt/README.md).
