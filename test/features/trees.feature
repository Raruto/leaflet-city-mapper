@coverage
Feature: Paris trees
  Scenario: Tree points produce measured trunks and schematic crowns with terrain and picking
    Given a leaflet map
    Then tree points preserve dimensions, terrain elevation, picking and validation

  Scenario: The Paris tree inventory controls styles and safe tooltips
    Given the Eiffel Tower example page is open
    Then tree inventory attributes control dimensions, crowns and tooltip estimates

  Scenario: Real tree PMTiles render alongside the other Paris overlays
    Given the Eiffel Tower example page is open with its offline archives
    Then the offline Paris trees render and recover after toggling
