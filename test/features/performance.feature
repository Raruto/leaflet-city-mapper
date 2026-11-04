Feature: Performance-oriented source style
  @unit
  Scenario: Sources avoid closures and functional iteration
    Then no source file defines functions inside functions or uses callback array methods
