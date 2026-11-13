# Utilities

[Source guide](../README.md) | [Project README](../../README.md)

Small shared helpers for ordering, wrapping values and yielding asynchronous work.

## When to use these helpers

`wrap` is specific to angles in radians, not arbitrary ranges. After
`yieldTask`, callers must recheck cancellation or revisions.

- [compareDistance.js](./compareDistance.js): compare items by distance.
- [wrap.js](./wrap.js): wrap an angle between negative and positive pi.
- [yieldTask.js](./yieldTask.js): yield to a timer.

Related: [globals](../globals/README.md), [sources](../sources/README.md).
