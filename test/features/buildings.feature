@coverage
Feature: Building volumes from PMTiles
  @unit
  Scenario: Source queues wait for shared renderer initialization
    Then source queues tolerate a shared renderer that is still initializing

  Scenario: Layer counts follow loaded geometry and control rebuilds
    Given a leaflet map
    Then layer counts report loaded elements and survive toggling and failures

  Scenario: Nearby source blocks share priority across layers
    Given a leaflet map
    Then source layers share load slots and start nearby blocks before distant ones

  Scenario: Cancelled building downloads release their slots and reload on return
    Given a leaflet map
    Then cancelled building downloads recover without errors or stale meshes

  Scenario: Building blocks cover the visible ground through camera changes
    Given a leaflet map
    Then building blocks cover pitched views and retain overlapping areas

  Scenario Outline: Invalid source blocks report errors without partial meshes
    Given a leaflet map
    Then a source block with "<invalid>" reports "<message>" without attaching a mesh

    Examples:
      | invalid            | message                     |
      | collection         | Invalid GeoJSON response    |
      | geometry           | Unsupported GeoJSON geometry |
      | coordinates        | Invalid GeoJSON coordinates |
      | empty polygon      | Empty GeoJSON polygon       |
      | short ring         | Invalid GeoJSON polygon ring |

  Scenario: Building volumes render with holes, storey heights, and interaction
    Given the Paris buildings example is open with sample volumes
    Then the building volumes preserve courtyards and elevated floors

  Scenario: Building coverage releases distant volumes and recovers from failures
    Given the Paris buildings example is open with sample volumes
    When I move and toggle the Paris building volumes
    Then 3D coverage follows the viewport, releases distant volumes, and recovers from failures

  Scenario Outline: The example filters invalid building volumes and estimates valid heights
    Given the Eiffel Tower example page is open
    Then building style for <storeys> storeys, <floors> floors and ground <ground> is "<result>"

    Examples:
      | storeys | floors | ground | result |
      | 4       | 5      | 1      | 15/0   |
      | 4       | 2      | 0      | 15/9   |
      | 0       | 1      | 1      | 3/0    |
      | -1      | 1      | 1      | skip   |
      | 4       | 0      | 0      | skip   |
      | 4       | 6      | 0      | skip   |
      | 4       | 2      | 2      | skip   |
