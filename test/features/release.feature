@unit
Feature: Automatic release versions
  Scenario: CI prepares elevation from source without requiring its CDN release
    Then integration preparation builds elevation once and propagates setup failures

  Scenario: Local npm version commands cannot change the package
    Then npm version fails without changing the package unless scripts are explicitly disabled

  Scenario: CD accepts only successful pushes to the release branch
    Then CD rejects failed runs, pull requests, other branches and forks
