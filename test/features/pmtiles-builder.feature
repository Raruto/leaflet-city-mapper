@unit
Feature: Offline PMTiles archive builder

  Scenario: Tree tiles keep inventory properties and own boundary points exactly once
    Given two trees on either side of a zoom 16 tile boundary
    When the trees are indexed into zoom 16 tiles
    Then each tree is in exactly one tile with its id and properties
    And indexing fails for invalid GeoJSON and invalid coordinates
    And points outside the archive are excluded while boundary points are kept

  Scenario: Every archive follows the buildings extent
    Then all archives and building queries use the same default or custom bbox

  Scenario: Archives run in parallel with a bounded job count
    Then archive builds respect the job limit and reject invalid selections before starting
    And a failed archive stops new jobs and waits for running builds

  Scenario: Streetlight tiles keep colocated lamps and their photometric records
    Given two streetlights at the same position
    When the streetlights are indexed into zoom 16 tiles
    Then both lamps are kept with their ids and photometric records

  Scenario Outline: Downloads retry missing or empty responses, then fail
    Then a download answered with HTTP <status> fails with "<error>" after 5 attempts

    Examples:
      | status | error               |
      | 404    | HTTP 404            |
      | 503    | HTTP 503            |
      | 200    | Empty tile response |

  Scenario: Downloads succeed after a transient error
    Then a download answered with HTTP 404 once then 200 returns the tile after 2 attempts
    And a download answered with HTTP 400 once then 200 returns the tile after 2 attempts

  Scenario: Archives publish every tile; failures keep the previous archive
    Given a 4-tile archive has been built
    Then its directory lists Hilbert tiles 1 to 4 with their data
    And a build missing a tile is not published and keeps the previous archive
    And a build with failing downloads is not published and keeps the previous archive
