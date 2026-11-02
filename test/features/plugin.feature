Feature: Separate plugin integration
  Scenario: The plugin routes source layers without changing Leaflet subclasses
    Given the city mapper plugin is loaded after leaflet-rotate
    Then source layers load lazily and Leaflet subclasses keep their behavior
