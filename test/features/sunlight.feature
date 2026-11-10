@coverage
Feature: Visible solar time control
  Scenario: Camera movement reuses static shadows
    Given a leaflet map
    Then shadow maps are reused until geometry, appearance or sunlight changes

  Scenario: Solar control initially shows current UTC time
    Given the offline Paris example loads only "Time"
    Then the solar control starts at current time inside the layer control

  Scenario: Solar slider selects UTC time and Now resumes the clock
    Given a leaflet map
    And a solar control is added to the map
    Then the solar slider selects a UTC minute and Now restores live time

  Scenario: Solar control recovers after toggles and invalid dates
    Given a leaflet map
    And a solar control is added to the map
    Then solar control toggles and invalid dates clear lighting and recover

  Scenario Outline: Solar depth, shadows and night lighting are checked independently
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings, Time"
    Then solar lighting preserves "<effect>"

    Examples:
      | effect                     |
      | depth map                  |
      | visible shadows            |
      | night without direct light |

  Scenario: Sky and terrain change from day to night
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Time"
    Then sky and terrain change from day to night and restore after removal

  Scenario: Sun and moon follow time and viewing direction
    Given a leaflet map
    And a solar control is added to the map
    Then the sun and moon follow the selected time and viewing direction
