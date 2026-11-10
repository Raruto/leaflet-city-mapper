@unit
Feature: Bounded scenario execution
  Scenario: Steps consume one thirty-second scenario budget
    Then scenario steps share one deadline without preventing cleanup

  Scenario: Test definitions cannot raise the scenario budget
    Then test steps and browser waits declare no timeout above thirty seconds
