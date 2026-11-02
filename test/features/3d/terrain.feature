@3d-layer
Feature: Terrain and raster imagery
  Scenario: Building roofs use geographically aligned raster imagery and retain styled walls
    Given a map with the standalone 3D module and no dependency import map
    Then roof imagery follows raster loading, background changes and renderer ownership

  Scenario Outline: Terrain deforms raster tiles and keeps buildings and the camera at their ground elevation
    Given a map with the standalone 3D module and no dependency import map
    Then terrain enabled "<order>" raster loading preserves imagery, elevations and removal

    Examples:
      | order  |
      | before |
      | after  |

  Scenario: Raster zoom transitions advance only with shared WebGPU frames
    Given a map with the standalone 3D module and no dependency import map
    Then raster zoom transitions stay paused between WebGPU frames and resume on removal
