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

  Scenario Outline: The minimal GeoJSON example preserves <check>
    Then the minimal GeoJSON example preserves "<check>"

    Examples:
      | check                 |
      | geometry              |
      | raster clipping left  |
      | raster clipping right |
      | lens interactions     |
      | lens reattachment     |

  Scenario: Reusable lens controls isolate maps and clean up their lifecycle
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then lens controls preserve clipping options and remove their handlers

  Scenario Outline: Local Colosseum lighting preserves <check>
    Then the Colosseum lighting JSON preserves "<check>"

    Examples:
      | check                |
      | night illumination   |
      | daylight suppression |
