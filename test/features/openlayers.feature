@openlayers @coverage
Feature: OpenLayers example bindings
  Scenario: Load the shared OpenLayers bindings standalone
    Given the shared example can load OpenLayers
    Then the shared OpenLayers bindings load standalone without extra stylesheets

  Scenario: Run the unchanged Paris source layers and camera on OpenLayers
    Given the shared example can load OpenLayers
    Then OpenLayers drives the source layers and camera without Leaflet JavaScript

  Scenario: Animate OpenLayers wheel and button zoom
    Given the shared example can load OpenLayers
    Then OpenLayers animates wheel and button zoom without restarting each frame

  Scenario: Match OpenLayers wheel steps to Leaflet
    Given the shared example can load OpenLayers
    Then OpenLayers wheel steps match Leaflet

  Scenario: Preserve the OpenLayers compass appearance and gestures
    Given the shared example can load OpenLayers
    Then the OpenLayers compass preserves the plugin appearance and gestures

  Scenario: Toggle OpenLayers overlays and basemaps
    Given the shared example can load OpenLayers
    Then the OpenLayers example preserves layer control interactions

  Scenario: Navigate OpenLayers with the mouse
    Given the shared example can load OpenLayers
    Then the OpenLayers example preserves mouse navigation

  Scenario: Navigate OpenLayers with touch gestures
    Given the shared example can load OpenLayers
    Then the OpenLayers example preserves touch navigation

  Scenario: Enter and exit OpenLayers walk mode
    Given the shared example can load OpenLayers
    Then the OpenLayers example enters and exits walk mode

  Scenario: Remove the OpenLayers renderer and map target
    Given the shared example can load OpenLayers
    Then the OpenLayers example removes its renderer and map target

  Scenario Outline: Switch from Leaflet to OpenLayers in <example>
    Given the comparison page "<example>" is open on Leaflet
    Then its button reloads the same scene on OpenLayers

    Examples:
      | example                          |
      | leaflet-city-mapper.html          |
      | leaflet-city-mapper-rome.html     |
      | leaflet-city-mapper-native.html   |

  Scenario Outline: Switch from OpenLayers to Leaflet in <example>
    Given the comparison page "<example>" is open on OpenLayers
    Then its button reloads the same scene on Leaflet

    Examples:
      | example                          |
      | leaflet-city-mapper.html          |
      | leaflet-city-mapper-rome.html     |
      | leaflet-city-mapper-native.html   |

  Scenario Outline: Render the OpenLayers comparison scene in <example>
    Given the comparison page "<example>" is open on OpenLayers
    Then the OpenLayers comparison scene renders its layers

    Examples:
      | example                          |
      | leaflet-city-mapper.html          |
      | leaflet-city-mapper-rome.html     |
      | leaflet-city-mapper-native.html   |

  Scenario: Render OpenLayers native icons and shadows
    Given the comparison page "leaflet-city-mapper-native.html" is open on OpenLayers
    Then the OpenLayers native scene renders icons and shadows

  Scenario: Interact with OpenLayers native shapes
    Given the comparison page "leaflet-city-mapper-native.html" is open on OpenLayers
    Then the OpenLayers native shapes retain tooltips and popups

  Scenario: Interact with OpenLayers native markers
    Given the comparison page "leaflet-city-mapper-native.html" is open on OpenLayers
    Then the OpenLayers native markers retain popups and dragging
