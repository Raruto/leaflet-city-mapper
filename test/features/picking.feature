@coverage
Feature: Picking and tooltips
  @unit
  Scenario: Dragging skips expensive picking and clears transient hover once
    Then pressed buttons, map dragging and zoom animation suspend hover picking

  Scenario: Vehicles keep moving while dragging without HTTP reloads
    Given a leaflet map
    Then dragging keeps GPU traffic animated without hover picking or lane requests

  Scenario: DOM tooltips stay inside the map and restore the previous cursor
    Given a leaflet map
    Then DOM tooltip content stays inside the map without interpreting text as HTML

  Scenario: Feature tooltips belong to their 3D layer and never pin on click
    Given a leaflet map
    Then a 3D layer creates and cleans up its own hover tooltip

  Scenario: Clicking a 3D object emits events without moving the map
    Given a leaflet map
    Then 3D click reports the picked object without changing the map view
