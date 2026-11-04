Feature: Standalone WebGPU camera with Leaflet as its only dependency
  Scenario: Camera projection and DOM overlays agree without CSS map rotation
    Given the city mapper plugin is loaded after Leaflet alone
    Then camera coordinates round-trip and native overlays remain aligned

  Scenario: Camera controls preserve keyboard, mouse and touch access
    Given the city mapper plugin is loaded after Leaflet alone
    Then camera orientation is accessible without dragging
    And camera mouse and touch gestures preserve Leaflet zoom and panning

  Scenario: The compact compass retains its appearance and drag behavior
    Given the city mapper plugin is loaded after Leaflet alone
    Then the compass retains its drag sensitivity and bearing-only option
