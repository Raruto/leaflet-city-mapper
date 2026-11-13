@smoke
Feature: Example smoke tests
  Scenario: The examples list is complete
    Then all HTML examples are listed

  Scenario: Cancelled archive requests are not mistaken for network failures
    Then smoke tests distinguish cancelled archive requests from network failures

  Scenario Outline: An example loads without browser errors
    Then the example "<example>" loads without browser errors

    Examples:
      | example |
      | leaflet-city-mapper.html |
      | leaflet-city-mapper-matterhorn.html |
      | leaflet-city-mapper-native.html |
      | leaflet-city-mapper-rome.html |
      | leaflet-city-mapper-vector-tiles.html |
