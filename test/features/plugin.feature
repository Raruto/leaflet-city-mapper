Feature: Separate plugin integration
  Scenario: Only the approved convenience methods are exposed on Leaflet
    Given the city mapper plugin is loaded after Leaflet alone
    Then maps and markers expose only the approved plugin methods

  Scenario: Global instance associations contain data instead of plugin methods
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then native instance data is isolated in explicit feature associations

  Scenario: The plugin does not add attributes to native Leaflet instances
    Given native Leaflet attributes are recorded before loading the plugin
    Then the plugin adds no methods or properties to native Leaflet instances

  Scenario: The plugin routes source layers without changing Leaflet subclasses
    Given the city mapper plugin is loaded after Leaflet alone
    Then source layers load lazily and Leaflet subclasses keep their behavior

  Scenario: Specialized source initializers remain lazy in the single bundle
    Given the city mapper plugin is loaded after Leaflet alone
    Then each source initializes from the single bundle

  Scenario: Leaflet initialization hooks retain their lifecycle
    Given the city mapper plugin is loaded after Leaflet alone
    Then layer and control hooks run once after initialization without leaking

  Scenario: Invalid source types report errors without blocking subsequent layers
    Given the city mapper plugin is loaded after Leaflet alone
    Then an unknown source rejects readiness and subsequent sources still initialize

  Scenario: The city example references existing local assets
    Given the city mapper plugin is loaded after Leaflet alone
    Then every local source in the city example is available

  Scenario Outline: Examples initialize without the published package
    Given the example "<example>" is loaded without the package CDN
    Then the example exposes its map and test operations for the selected Leaflet version

    Examples:
      | example                      |
      | leaflet-city-mapper          |
      | leaflet-city-mapper-rome  |
      | leaflet-city-mapper-native   |
