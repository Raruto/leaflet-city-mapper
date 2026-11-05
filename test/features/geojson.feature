@coverage
Feature: Standalone GeoJSON sources
  Scenario Outline: GeoJSON uses the shared extrusion pipeline
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then a GeoJSON source from "<input>" renders and supports replacement and re-adding

    Examples:
      | input  |
      | inline |
      | url    |

  Scenario: Invalid and obsolete GeoJSON loads do not attach meshes
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then GeoJSON reports invalid sources and cancels obsolete downloads

  Scenario: The minimal GeoJSON example reveals archaeology through a local aerial lens
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then the minimal GeoJSON example renders the Colosseum at different heights

  Scenario: Reusable lens controls isolate maps and clean up their lifecycle
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then lens controls preserve clipping options and remove their handlers

  Scenario: Local Colosseum facade and main-road lighting follows the simulated night
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then the Colosseum lighting JSON illuminates the facade and main roads only at night
