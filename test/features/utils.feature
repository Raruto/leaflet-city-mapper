Feature: Standalone 3D utilities
  @unit
  Scenario: Every demo data file fits the GitHub 100 MiB Git limit
    Then every demo data file fits the GitHub upload size limit

  @unit
  Scenario: Build outputs keep readable and minified bundles separate from compatibility libraries
    Then the build generates readable and minified bundles and standalone compatibility files

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
