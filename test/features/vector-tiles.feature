@coverage
Feature: Vector tiles without an external renderer
  Scenario: MVT geometry and screen-aligned labels render directly on WebGPU
    Then the vector tiles example preserves geometry and label sizes through zoom and rotation

  @unit
  Scenario Outline: Vector tile source modules justify their owned allocations
    Then local allocation checks accept source directory "<directory>"

    Examples:
      | directory        |
      | src/mvt          |
      | src/vector-style |
      | src/vector-tiles |
