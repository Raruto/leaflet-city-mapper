@coverage
Feature: Indicative Paris night lighting
  Scenario: Real lamp inventory preserves supports, geometry and safe tooltips
    Given the offline Paris example loads only "Streetlights, Eiffel Tower, Time"
    Then the real streetlight inventory has valid geometry, supports and tooltips

  Scenario Outline: Real lighting renders <effect>
    Given the offline Paris example loads only "<layers>"
    Then real night lighting preserves "<effect>"

    Examples:
      | effect                               | layers                                                           |
      | streetlight ground illumination      | Orthophoto IGN, Terrain (3D), Streetlights, Time                   |
      | Eiffel Tower sparkle                 | Orthophoto IGN, Terrain (3D), Eiffel Tower, Time                   |
      | illumination on 3D surfaces           | Orthophoto IGN, Terrain (3D), Buildings, Streetlights, Eiffel Tower, Time |
      | daylight poles and disabled lighting | Orthophoto IGN, Terrain (3D), Streetlights, Time                   |

  Scenario: Streetlight toggles rebuild the inventory without stale meshes
    Given the offline Paris example loads only "Streetlights, Time"
    Then streetlight toggles release areas and rebuild fresh meshes

  @unit
  Scenario: Lamp styles follow the recorded inventory with documented fallbacks
    Given the real example streetlight style is loaded without a browser
    Then a lamp 7 m high with 13165 lm at 2700 K is 7 m high, lights 10.5 m scaled by the flux and is warm white
    And a lamp without valid records uses the default 6 m height
    And sodium lamps are warmer than the default and 6500 K lamps are bluish
    And the light radius stays between 6 and 22 m
    And lamps on "Candélabre, Mât, Porte LAC RATP" have a 0.12 m pole
    And lamps on "Console, Applique, Projecteur, Sol" have no pole
    And underground lamps are excluded:
      | property        | value                                  | shown |
      | lib_ouvrag      | Galerie                                | no    |
      | lib_ouvrag      | Eclairage Poste et Galeries de service | no    |
      | voie_libelle    | CHARLES DE GAULLE (souterrain pieton)  | no    |
      | voie_libelle    | TUNNEL DES TUILERIES                   | no    |
      | voie_libelle    | Local sous-sol                         | no    |
      | support_hauteur | -2.0                                   | no    |
      | voie_libelle    | RUE DE RIVOLI                          | yes   |
