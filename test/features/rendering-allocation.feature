Feature: Rendering allocation ownership
  @unit
  Scenario: Terrain grid and atlas results keep independent upload data
    Then terrain allocation results preserve grid topology and no-data sampling

  @unit
  Scenario: Reused GPU descriptors preserve program and mesh ownership
    Then rendering allocation scratch preserves GPU descriptors and independent uniforms

  Scenario: Reused shadow math matches the matrix projection
    Given a leaflet map
    Then allocation-free shadow intermediates preserve projection matrices and bounds ownership
