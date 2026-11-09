Feature: Offline Cloud Optimized GeoTIFF sources
  @unit
  Scenario: Node generates cloud-optimized TIFFs without Python or native GIS libraries
    Then the Node COG builder verifies PNG decoding, TIFF output and cloud layout offline

  @unit
  Scenario: The COG reader decodes ranged elevation tiles and rejects unsupported data
    Then COG ranges and TIFF profile validation preserve elevation samples

  Scenario: COG worker requests share the geometry pool without retaining TIFF parsing on the main thread
    Then COG workers preserve ranges, cache ownership, missing tiles and errors

  @coverage
  Scenario: The local Colosseum COGs render aerial and archaeological imagery on real relief
    Given the instrumented city mapper plugin is loaded after Leaflet alone
    Then local archaeological COGs load by range and displace the ground

  Scenario: Shifted COG imagery preserves source registration and transparent edges
    Then shifted COG imagery is retiled without moving its footprint
