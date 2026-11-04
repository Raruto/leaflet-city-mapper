@coverage
Feature: Native PMTiles archives
  Scenario: PMTiles layer methods handle range archives without external libraries
    Given a leaflet map
    Then the native PMTiles methods handle directories, compression and failures

  Scenario: PMTiles layers initialize their archives
    Given a leaflet map
    Then PMTiles layers own archive initialization and native zoom selection
