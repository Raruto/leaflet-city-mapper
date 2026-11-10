Feature: Traffic lanes, flows and timetables
  @unit
  Scenario: Traffic reuses interpolation scratch without sharing light snapshots
    Then traffic interpolation scratch preserves lights and invalidates lighting snapshots


  @unit
  Scenario: Unchanged traffic trips are distinct from failed refreshes
    Then unchanged traffic refreshes preserve their clock and status without rebuilding

  @coverage
  Scenario: Traffic counts share a compact wrapping group
    Given a leaflet map
    Then traffic counts wrap together and clean up across layer toggles

  @unit
  Scenario: Traffic allocation cleanup preserves route geometry and result ownership
    Then traffic scratch preserves route vertices and independent lane and pose results

  @unit
  Scenario: Traffic is fetched over HTTP per map, with honest count provenance
    Then HTTP traffic loaders refresh per map and distinguish measured from assumed flows
    And cycling counts are only assigned to nearby paths and preserve zero or missing coverage

  @coverage @traffic-compute
  Scenario: Shared GPU vehicle poses preserve every vertex and normal
    Given a leaflet map
    Then all traffic models match CPU poses on GPU workgroup boundaries

  @unit
  Scenario: Mobility conversion excludes roads for pedestrians and obsolete route records
    Then mobility paths are clipped, deduplicated and validated without inventing pedestrian roads

  @coverage @mobility
  Scenario: All six HTTP-driven mobility modes preserve clock motion and GPU picking
    Given the cycling and pedestrian example layers are open
    Then all six mobility modes move with the clock and match their GPU picking poses

  @coverage @mobility
  Scenario: One traffic toggle disables and restores all six HTTP-driven modes
    Given the cycling and pedestrian example layers are open
    Then the Traffic toggle disables and restores all six mobility modes

  @coverage @cruises
  Scenario: Tourist boats follow manual and live clocks and close for the night
    Given the focused cruise example is open without terrain
    Then cruise departures follow manual and live clocks and close for the night

  @coverage @cruises
  Scenario: Tourist boat poses preserve water heights and picking metadata
    Given the focused cruise example is open with terrain
    Then cruise boats share terrain rendering and preserve water heights and picking metadata

  @coverage @cruises
  Scenario: Tourist boats recover from invalid dates and clear stale highlights
    Given the focused cruise example is open without terrain
    Then cruise boats clear stale highlights and recover from invalid dates

  @coverage @cruises
  Scenario: Tourist boats and their route stay visible above the offline river terrain
    Given the focused cruise example is open with terrain
    Then the cruise route and boats remain visible above the offline river terrain

  @coverage @cruises
  Scenario: Tourist boat toggles release buffers and restore fresh geometry
    Given the focused cruise example is open without terrain
    Then the Traffic toggle releases cruise buffers and restores fresh boats

  @coverage @cruises
  Scenario: Tourist boats use the current timetable without a time control
    Given the focused cruise example is open without terrain
    Then cruise boats use the current timetable when the time control is removed

  @unit
  Scenario Outline: Vehicle count follows the measured flow
    Then a 300 m lane with <flow> vehicles per hour at <speed> m/s holds <count> vehicles

    Examples:
      | flow | speed | count |
      | 0    | 8     | 0     |
      | 1200 | 8     | 13    |
      | 960  | 16    | 5     |

  @unit
  Scenario: Busier lanes hold proportionally more vehicles, all inside the lane
    Then a 300 m lane holds more than 3 times the vehicles at 1600 than at 400 vehicles per hour
    And every vehicle of a 300 m lane at 900 vehicles per hour lies inside the lane

  @unit
  Scenario: Vehicles interpolate position, ground height and heading along a lane
    Then along a lane 50 m from the start is at x 50, height 15, z 0 heading east
    And along a flat lane 125 m from the start is at x 100, height 0, z 25 heading north

  @unit
  Scenario: Long routes use logarithmic lookup without changing segment boundaries
    Then long traffic routes preserve interpolation at endpoints and repeated coordinates

  @unit
  Scenario Outline: Unpublished Paris counting hours fall back to the same weekday and hour
    Then the Paris counting hour for "<time>" is "<hour>"

    Examples:
      | time                 | hour                     |
      | 2026-11-01T17:40:00Z | 2026-11-01T17:00:00.000Z |
      | 2026-11-02T12:59:00Z | 2026-10-26T12:00:00.000Z |
      | nope                 | error                    |

  @unit
  Scenario Outline: Seasonal cruise departures follow Paris local time
    Then at "<time>" the cruises in service are "<departures>"

    Examples:
      | time                 | departures   | note                       |
      | 2026-11-02T09:14:59Z |              | before the first winter boat |
      | 2026-11-02T09:15:00Z | 10:15        | first winter boat departs  |
      | 2026-11-02T10:00:00Z | 10:15, 11:00 |                            |
      | 2026-11-02T10:15:00Z | 11:00        |                            |
      | 2026-06-21T08:30:00Z | 10:00, 10:30 | summer: every 30 minutes   |
      | 2026-11-02T21:29:59Z | 21:30        | last boat about to arrive  |
      | 2026-11-02T21:30:00Z |              |                            |
      | 2026-11-02T02:00:00Z |              | night                      |
      | 2026-10-24T20:30:00Z | 22:00        | October Saturday late boat |
      | 2026-10-23T20:30:00Z |              | not on Fridays             |
      | 2026-03-28T09:15:00Z | 10:15        | winter time                |
      | 2026-03-29T08:15:00Z | 10:15        | after the DST change       |
      | 2026-10-24T08:00:00Z | 10:00        | summer time                |
      | 2026-10-25T09:00:00Z | 10:00        | after the DST change       |

  @unit
  Scenario: Cruise trips report progress and reject invalid dates
    Then the cruise departing at "10:00" is halfway at "2026-06-21T08:30:00Z"
    And cruise progress grows from "2026-06-21T09:10:00Z" to "2026-06-21T09:10:01Z"
    And cruises at "invalid" fail with "Invalid date"

  @unit
  Scenario: The cruise route is a closed loop on the Seine in central Paris
    Then the cruise route ends where it starts
    And the cruise route is between 10 and 16 km long
    And the cruise route stays between latitudes 48.849 and 48.865 and longitudes 2.285 and 2.362
