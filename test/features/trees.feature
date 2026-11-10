@coverage
Feature: Paris trees
  Scenario: Tree points produce measured trunks and schematic crowns with terrain and picking
    Given a leaflet map
    Then tree points preserve dimensions, terrain elevation, picking and validation

  Scenario: The Paris tree inventory controls styles and safe tooltips
    Given the offline Paris example loads only "Trees, Time"
    Then tree inventory attributes control dimensions, crowns and tooltip estimates

  Scenario: Real tree PMTiles render alongside the other Paris overlays
    Given the offline Paris example loads only "Buildings, Trees, Time"
    Then the offline Paris trees preserve "inventory and shared rendering"

  Scenario: Real tree PMTiles rebuild fresh meshes after toggling
    Given the offline Paris example loads only "Buildings, Trees, Time"
    Then the offline Paris trees preserve "fresh meshes after toggling"
