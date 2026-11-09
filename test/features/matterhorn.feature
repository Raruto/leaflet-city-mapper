@coverage
Feature: Mapterhorn terrain example
  Scenario: Remote elevation follows a native satellite layer beyond the initial view
    Then the Matterhorn example streams elevations for its satellite tiles while navigating
