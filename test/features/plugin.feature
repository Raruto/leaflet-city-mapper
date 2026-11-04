Feature: Separate plugin integration
  Scenario: The plugin routes source layers without changing Leaflet subclasses
    Given the city mapper plugin is loaded after leaflet-rotate
    Then source layers load lazily and Leaflet subclasses keep their behavior

  Scenario: Specialized source utilities are loaded only on first use
    Given the city mapper plugin is loaded after leaflet-rotate
    Then each source loads only its requested initializer

  Scenario: Invalid source types report errors without blocking subsequent layers
    Given the city mapper plugin is loaded after leaflet-rotate
    Then an unknown source rejects readiness and subsequent sources still initialize

  @offline
  Scenario: The city example references existing local assets
    Given the city mapper plugin is loaded after leaflet-rotate
    Then every local source in the city example is available
