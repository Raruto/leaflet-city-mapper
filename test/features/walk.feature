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

  Scenario: The keyboard walks a pedestrian over a bridge deck while dragging only turns the camera and buildings block it
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings"
    Then the walk layer moves the pedestrian on Pont d'Iéna, stops it at walls and Esc restores the map
