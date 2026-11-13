@coverage
Feature: Vector tiles without an external renderer
  Scenario: MVT geometry and screen-aligned labels render directly on WebGPU
    Given the vector tiles example is loaded with offline fixtures
    Then the vector tiles example preserves geometry and label sizes through zoom and rotation

  Scenario: MVT sources switch without mixing layers or requests
    Given the vector tiles example is loaded with offline fixtures
    Then vector tile sources switch without mixing layers or requests

  @unit
  Scenario Outline: Vector tile source modules justify their owned allocations
    Then local allocation checks accept source directory "<directory>"

    Examples:
      | directory        |
      | src/mvt          |
      | src/vector-style |
      | src/vector-tiles |
