@3d-layer
Feature: Native Leaflet layers rendered automatically with WebGPU
  Scenario Outline: Native raster, vector and marker layers share the GPU scene
    Given the native WebGPU gallery uses the "<renderer>" renderer preference
    Then native map content is drawn by WebGPU while HTML UI remains native
    And native rendering avoids DOM geometry reads and pan-time path rebuilds
    And native popups and tooltips remain above the GPU canvas
    And native layer changes, interactions and removal preserve Leaflet behavior

    Examples:
      | renderer |
      | SVG      |
      | Canvas   |

  Scenario: Non-raster GridLayer tiles report an explicit error
    Given the native WebGPU gallery uses the "SVG" renderer preference
    Then HTML grid tiles report an error instead of silently disappearing
