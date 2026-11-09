@openlayers @coverage
Feature: OpenLayers example bindings
  Scenario: Run the unchanged Paris example on an OpenLayers map
    Given the shared example can load OpenLayers
    Then OpenLayers drives the source layers and camera without Leaflet JavaScript
    And OpenLayers animates wheel and button zoom without restarting each frame
    And OpenLayers wheel steps match Leaflet
    And the OpenLayers compass preserves the plugin appearance and gestures
    And the OpenLayers example preserves map and layer control interactions

  Scenario Outline: Compare engines in each existing example
    Given the comparison page "<example>" is open
    Then its button reloads the same scene on OpenLayers and back to Leaflet

    Examples:
      | example                          |
      | leaflet-city-mapper.html          |
      | leaflet-city-mapper-rome.html  |
      | leaflet-city-mapper-native.html   |
