Feature: Standalone WebGPU camera with Leaflet as its only dependency
  @unit
  Scenario: Direct camera state updates retain the scheduled animation
    Then the camera WeakMap stores the same animation that is scheduled

  @unit
  Scenario: Camera projection allocates only its independent result point
    Then camera projection preserves its formulas without intermediate point instances

  @unit
  Scenario: Camera scratch buffers do not alias retained results
    Then camera scratch buffers preserve independent results and matrix transforms

  Scenario: Camera projection and DOM overlays agree without CSS map rotation
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then camera coordinates round-trip and native overlays remain aligned

  Scenario: Camera controls preserve keyboard, mouse and touch access
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then camera orientation is accessible without dragging
    And camera mouse and touch gestures preserve Leaflet zoom and panning

  Scenario: Opt-in camera inclination supports views below the ground
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then an extended pitch orbits below ground without breaking navigation or controls

  Scenario: The compact compass retains its appearance and drag behavior
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then the compass retains its drag sensitivity and bearing-only option

  Scenario: Navigation keeps screen anchors and the visible ground inside maximum bounds
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then pitched zoom, panning and marker focus preserve their screen anchors

  Scenario: Device orientation, container resizing and gesture cleanup remain supported
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then compass permissions, landscape headings and camera cleanup are preserved
