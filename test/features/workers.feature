Feature: Geometry worker ownership
  @unit
  Scenario: Prepared geometry preserves the CPU extrusion and point pipelines
    Then prepared geometry matches CPU vertices, lights, ranges and instancing

  @unit
  Scenario: Geometry worker tasks release resources on success, errors and cancellation
    Then geometry worker tasks transfer results and terminate on every exit

  Scenario: Geometry workers run off-thread with transferable buffers
    Then native and bundled geometry workers preserve results without blocking animation frames

  Scenario: Cross-origin geometry workers load with CORS
    Then cross-origin geometry workers preserve results, report failures and release blob URLs

  @coverage
  Scenario: Large GeoJSON blocks use workers without changing mesh ownership
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then large GeoJSON blocks match CPU meshes and preserve replacement and cancellation
