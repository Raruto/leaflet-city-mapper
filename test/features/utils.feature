Feature: Standalone 3D utilities
  @unit
  Scenario: Shared numeric constants preserve projection, astronomy and lighting formulas
    Then precomputed constants match their original numeric formulas

  @unit
  Scenario: Known-size geometry arrays preserve coordinates and independent results
    Then preallocated geometry arrays retain their shape and ownership

  @unit
  Scenario Outline: Scene computations do not require a Leaflet layer or GPU
    Then the standalone 3D "<domain>" utilities preserve their results and errors

    Examples:
      | domain   |
      | geometry |
      | graph    |
      | archives |
      | archive-requests |
      | models   |
      | lighting |
      | terrain  |
      | traffic  |
      | walking  |
      | shaders  |
      | sky      |
      | simulation-clock |
      | dev-server |
      | roof-coverage |

  @coverage
  Scenario: Browser math utilities preserve transforms, camera projection and ray intersections
    Given a leaflet map
    Then standalone browser math preserves scene transforms and picking
