@coverage
Feature: glTF models
  Scenario: Configured glTF loading retains objects and loads external PBR assets
    Given a leaflet map
    Then configured models preserve external assets and can be detached and reattached

  Scenario: Native geometry and model decoding preserve holes and accessor layouts
    Given a leaflet map
    Then native triangulation and glTF decoding preserve geometry without library requests

  Scenario: Model layers own loading, transforms and attribution
    Given a leaflet map
    Then a configured 3D model loads with its transforms and attribution

  Scenario Outline: Model failures are reported without attaching broken geometry
    Given a leaflet map
    When I load a configured 3D model with "<failure>"
    Then 3D initialization emits "<message>" as an error
    And the failed model has no attached geometry

    Examples:
      | failure            | message                            |
      | HTTP error         | Unable to load model: HTTP 404     |
      | unsupported glTF   | Layer3D supports static triangle glTF models without required extensions |
      | truncated GLB      | Truncated GLB data                 |

  Scenario: Hovering and clicking the Eiffel Tower shows information without moving or pinning
    Given the Eiffel Tower example page is open
    When I hover and click the Eiffel Tower in the 3D example
    Then the tower information is shown without moving the map or pinning the tooltip

  Scenario: The real Eiffel Tower model follows the map camera
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Eiffel Tower"
    When I visit and inspect the Eiffel Tower 3D model
    Then the tower is rendered at its geographic position through camera changes
