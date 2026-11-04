@3d-layer
Feature: Standalone GeoJSON sources
  Scenario Outline: GeoJSON uses the shared extrusion pipeline
    Given the city mapper plugin is loaded after Leaflet alone
    Then a GeoJSON source from "<input>" renders and supports replacement and re-adding

    Examples:
      | input  |
      | inline |
      | url    |

  Scenario: Invalid and obsolete GeoJSON loads do not attach meshes
    Given the city mapper plugin is loaded after Leaflet alone
    Then GeoJSON reports invalid sources and cancels obsolete downloads

  Scenario: The minimal GeoJSON example renders the Colosseum over OpenStreetMap
    Given the city mapper plugin is loaded after Leaflet alone
    Then the minimal GeoJSON example renders the Colosseum at different heights
