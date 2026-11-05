Feature: Standalone 3D utilities
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
