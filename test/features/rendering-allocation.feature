Feature: Rendering allocation ownership
  @unit
  Scenario: Camera movement reuses culling spheres without stale visibility
    Then culling spheres follow bounds and transforms while reusing unchanged world data

  @unit
  Scenario: Bounding volumes retain their results without per-vertex square roots
    Then mesh bounds match vertex distances for static and instanced geometry

  @unit
  Scenario: Loading indicators do not interrupt source updates
    Then loading indicators use layer state and retain error accessibility

  @unit
  Scenario: Terrain grid and atlas results keep independent upload data
    Then terrain allocation results preserve grid topology and no-data sampling

  @unit
  Scenario: Reused GPU descriptors preserve program and mesh ownership
    Then rendering allocation scratch preserves GPU descriptors and independent uniforms

  @unit
  Scenario: Terrain grid buffers keep their backend and subdivision ownership
    Then terrain buffers are cached by subdivision and isolated by backend

  Scenario: Reused shadow math matches the matrix projection
    Given a leaflet map
    Then allocation-free shadow intermediates preserve projection matrices and bounds ownership
