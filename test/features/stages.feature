Feature: Decomposed rendering and source stages
  @unit
  Scenario: Operation contexts keep maps and areas independent
    Then operation contexts isolate nested geometry and source mesh attachment

  @unit
  Scenario: Shared helpers preserve math, callbacks and control cleanup
    Then shared helpers preserve math, callbacks and control cleanup

  @unit
  Scenario: Source stages retain geometry, validation and cancellation
    Then source stages preserve features, errors and load completion

  @unit
  Scenario: Frame stages retain visibility, fading and buffer reuse
    Then frame stages preserve visibility, fading and buffer reuse

  @unit
  Scenario: Roof atlases and frame uniforms retain GPU uploads and resources
    Then roof and uniform stages preserve GPU uploads and resource reuse

  @unit
  Scenario: Shadow stages retain cache invalidation and draw ranges
    Then shadow stages preserve cache invalidation and draw ranges

  Scenario: Frame optimizations reuse buffers and preserve transforms
    Then frame optimizations preserve buffer isolation, directions and winding

  @unit
  Scenario: Repeated source geometry compacts without precision or style changes
    Then source instancing preserves vertex data and falls back for incompatible features

  @coverage
  Scenario: Instanced sources retain pixels, shadows, picking and GPU restoration
    Then instanced sources preserve rendered pixels, shadows, picking and resource lifetime
