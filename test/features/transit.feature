@unit
Feature: Illustrative public transport on IDFM open-data routes
  Scenario: Fetched routes drive distinct moving vehicle models
    Then Paris transit routes produce moving bus, tram and metro simulations

  Scenario: Clipping does not invent paths between disconnected route parts
    Then transit clipping preserves disjoint route parts and reports invalid data

  Scenario: Transit route dashes retain line colours and terrain height
    Then transit route dashes follow line colours and sloping terrain
