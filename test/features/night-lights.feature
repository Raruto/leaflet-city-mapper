@coverage
Feature: Indicative Paris night lighting
  Scenario: Real lamp inventory preserves supports, geometry and safe tooltips
    Given the offline Paris example loads only "Streetlights, Eiffel Tower, Time"
    Then the real streetlight inventory has valid geometry, supports and tooltips

  Scenario Outline: Real lighting renders one effect at a time
    Given the offline Paris example loads only "Orthophoto IGN, Terrain (3D), Buildings, Streetlights, Eiffel Tower, Time"
    Then real night lighting preserves "<effect>"

    Examples:
      | effect                                  |
      | streetlight ground illumination         |
      | Eiffel Tower sparkle                    |
      | illumination on 3D surfaces              |
      | daylight poles and disabled lighting    |

  Scenario: Streetlight toggles rebuild the inventory without stale meshes
    Given the offline Paris example loads only "Streetlights, Time"
    Then streetlight toggles release areas and rebuild fresh meshes

  Scenario: Lamp styles follow the recorded inventory with documented fallbacks
    Given the Eiffel Tower example page is open
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
