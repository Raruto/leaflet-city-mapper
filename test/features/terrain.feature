@coverage
Feature: Terrain and raster imagery
  Scenario: Buildings and their roof imagery appear together
    Given a leaflet map
    Then buildings wait only for their own roof imagery and never restart their appearance

  Scenario: Raster transitions blend smoothly without refading retained tiles
    Given a leaflet map
    Then new ground tiles blend continuously while retained tiles stay opaque

  Scenario: Progressive ground coverage survives delayed detail
    Given a leaflet map
    Then coarse ground imagery precedes detail and survives delayed replacements

  Scenario: Overlapping terrain tiles never punch holes during zoom and pan
    Given a leaflet map
    Then fading terrain detail covers retained ground without depth interference

  Scenario: Streamed objects appear progressively without changing opaque depth
    Given a leaflet map
    Then streamed geometry dissolves progressively while remaining opaque

  Scenario Outline: Building surfaces use geographically aligned raster imagery independently
    Given a leaflet map
    Then "<surfaces>" imagery with wall opacity "<opacity>" follows raster loading, background changes and renderer ownership

    Examples:
      | surfaces | opacity |
      | roofs    | default |
      | walls    | default |
      | both     | default |
      | both     | 0       |
      | both     | 0.25    |
      | both     | 1       |
      | soft-roofs | 0.25  |

  Scenario Outline: Terrain deforms raster tiles and keeps buildings and the camera at their ground elevation
    Given a leaflet map
    Then terrain enabled "<order>" raster loading preserves imagery, elevations and removal

    Examples:
      | order  |
      | before |
      | after  |

  Scenario: Raster zoom transitions advance only with shared WebGPU frames
    Given a leaflet map
    Then raster zoom transitions stay paused between WebGPU frames and resume on removal
