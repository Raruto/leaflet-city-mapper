@coverage
Feature: Mapterhorn terrain example
  Background:
    Given the Matterhorn example is open with offline elevation and satellite tiles

  Scenario: Matterhorn samples and camera follow the elevation grid
    Then Matterhorn elevation samples, camera height and viewport coverage match the DEM

  Scenario: Matterhorn cache eviction preserves terrain and depth ordering
    Then Matterhorn terrain survives cache eviction and is independent of tile draw order

  Scenario: Matterhorn zoom preserves terrain and marker alignment
    Then Matterhorn zoom keeps coarse terrain visible and aligns the marker and popup

  Scenario: Matterhorn navigation and elevation lifecycle stay independent
    Then Matterhorn streams a new region and releases and restores its elevation layer
