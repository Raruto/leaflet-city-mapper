@openlayers @coverage
Feature: OpenLayers example bindings
  Scenario: Run the unchanged Paris example on an OpenLayers map
    Given the OpenLayers example replaces only the Leaflet script and stylesheet
    Then OpenLayers drives the source layers and camera without Leaflet JavaScript
    And OpenLayers animates wheel and button zoom without restarting each frame
    And OpenLayers wheel steps match Leaflet
    And the OpenLayers compass preserves the plugin appearance and gestures
    And the OpenLayers example preserves map and layer control interactions
