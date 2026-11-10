@coverage
Feature: Shared WebGPU renderer
  Scenario: Panning reuses WebGPU frame resources and keeps frustum culling
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings, Time"
    When I pan the shared WebGPU renderer
    Then WebGPU matrices match DOMMatrix and frame resources are reused

  Scenario Outline: Shared WebGPU preserves <behavior>
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings, Time"
    When I measure WebGPU "<behavior>"
    Then WebGPU "<behavior>" preserves its rendering invariants

    Examples:
      | behavior          |
      | frame scheduling  |
      | panning uniforms  |
      | shader highlights |
      | animated zoom     |

  Scenario: The roof atlas is composed on the GPU from raster tile textures
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings, Time"
    When I rebuild the WebGPU roof atlas
    Then the roof atlas matches its raster tiles without uploading a canvas

  Scenario: Terrain tiles are uploaded on arrival and follow the projected DEM grid
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Time"
    When I inspect the WebGPU terrain tiles
    Then terrain tiles are uploaded before rendering and match the projected DEM grid
