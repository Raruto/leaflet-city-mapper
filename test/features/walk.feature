@coverage
Feature: Third-person walk mode
  @unit
  Scenario: Walk coordinate buffers stay owned by each walker
    Then walk coordinate conversion reuses only its caller-owned buffer

  @unit
  Scenario: Walk collision includes instanced objects and moving traffic
    Then walk collision detects enclosed instances and moving traffic

  Scenario: Time and Walk controls support standalone use, removal and reuse
    Given a leaflet map
    Then Time and Walk controls clean up and can be added again

  @unit
  Scenario: Walk scratch is reused per map and duplicate controls are rejected
    Then Walk scratch stays map-owned across control replacement

  Scenario: Time state is reused per map and duplicate controls are rejected
    Given a leaflet map
    Then Time state stays map-owned across control replacement

  Scenario: Keyboard movement checks obstacles and holding Space ascends over them
    Given a leaflet map
    Then keyboard walking moves toward a wall, stops at it and can move away

  Scenario Outline: Walking in Paris preserves <check>
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings"
    Then walking in Paris preserves "<check>" and Esc restores the map

    Examples:
      | check              |
      | bridge movement    |
      | bridge camera      |
      | building collision |
