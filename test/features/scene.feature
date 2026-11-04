@coverage
Feature: Shared 3D scene
  Scenario: Layer-owned objects preserve math and scene ordering without engine classes
    Given a leaflet map
    Then layer-owned objects preserve values and visibility without engine classes

  Scenario: Automatic origins are assigned on first addition and stay fixed
    Given a leaflet map
    Then 3D layers without a location keep their first map origin

  Scenario: Independent layers share one renderer and transfer ownership without changing geographic origins
    Given a leaflet map
    When I add and remove independent 3D layers
    Then 3D groups retain their geographic origins and share resources only on the same map

  Scenario: Dependency loading errors are reported to the caller
    Given a leaflet map
    Then an unavailable WebGPU adapter emits an error and shows a warning without leaving a canvas

  Scenario Outline: Changing the background preserves the 3D scene
    Given the Eiffel Tower example page is open
    When I select the "<background>" background in the 3D example
    Then only the "<background>" background is active and the 3D scene is unchanged

    Examples:
      | background     |
      | Empty          |
      | Plan IGN       |
      | Orthophoto IGN |

  Scenario: The layer control owns the shared canvas and model attribution
    Given the Eiffel Tower example page is open
    When I disable and restore the 3D overlays through the layer control
    Then the 3D canvas and model attribution follow the enabled overlays
