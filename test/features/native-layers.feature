@coverage
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

  Scenario: GPU paths retain Leaflet event propagation
    Given the native WebGPU gallery uses the "SVG" renderer preference
    Then native pointer events respect bubbling and propagation cancellation

  Scenario: Animated zoom remains smooth and aligned
    Given the native WebGPU gallery uses the "SVG" renderer preference
    Then native zoom animation interpolates the GPU camera and accessible marker targets

  Scenario: Native mutations preserve Leaflet utility methods and stacking
    Given the native WebGPU gallery uses the "SVG" renderer preference
    Then native icon transitions, hover stacking and closest path points remain available
