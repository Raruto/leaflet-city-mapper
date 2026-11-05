@unit @complexity
Feature: Strict production function complexity
  Scenario: Complexity measurements and threshold boundaries are reliable
    Then complexity metrics distinguish decisions, nesting and independent functions

  Scenario: All production functions respect length and complexity limits
    Then production functions stay within strict complexity limits
