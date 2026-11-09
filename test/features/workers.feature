Feature: Geometry worker ownership
  @unit
  Scenario: Main bundle does not retain geometry preparation
    Then the main bundle excludes source preparation and stays below 245 KB

  @unit
  Scenario: One worker bundle handles geometry and vector tiles
    Then the shared worker dispatches geometry and vector tiles with isolated responses

  @unit
  Scenario: Model workers transfer prepared vertex data instead of cloning binary resources
    Then model worker bundles transfer decoded attributes and generated normals exactly once

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

  Scenario: Cross-origin vector tile workers load with CORS
    Then cross-origin vector tile workers preserve results and release blob URLs on every exit

  @coverage
  Scenario: All GeoJSON blocks use workers without changing mesh ownership
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then all GeoJSON blocks use workers and preserve replacement and cancellation
