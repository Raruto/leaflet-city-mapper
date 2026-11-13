Feature: Performance-oriented source style
  @unit
  Scenario: Import layout checks handle spacing, comments and ordering
    Then source import layout checks handle these modules:
      | source                                                                               | violations |
      | import 'a';\nimport 'b';\n\nexport const value = 1;                                   | 0 |
      | import 'a';\n\nimport 'b';\n\nexport const value = 1;                                 | 1 |
      | import 'a'; import 'b';\n\nexport const value = 1;                                    | 1 |
      | import 'a';\nimport 'b';\nexport const value = 1;                                     | 1 |
      | import 'a';\nimport 'b';\n\n\nexport const value = 1;                                 | 1 |
      | export const value = 1;\nimport 'a';                                                  | 1 |
      | const value = 1;\nimport 'a';                                                         | 1 |
      | import 'a';\n\nexport const value = 1;\nimport 'b';                                   | 1 |
      | // Header\nimport 'a';\n// Related import\nimport 'b';\n\n/** Value. */\nexport const value = 1; | 0 |
      | import 'a'; // Explanation\nimport 'b'; // Explanation\n\nexport const value = 1;     | 0 |
      | import 'a'; // Explanation\nexport const value = 1;                                   | 1 |
      | import 'a';\n/** Value. */\nexport const value = 1;                                   | 1 |
      | import 'a';\nimport 'b';                                                             | 0 |
      | export { value } from 'a';                                                           | 0 |
      | const text = "import 'a';";                                                          | 0 |

  @unit
  Scenario: Source modules place imports together at the top
    Then source modules place imports together at the top

  @unit
  Scenario: Leaflet binding checks reject implicit globals and alternate global access
    Then Leaflet binding checks handle these modules:
      | file                   | source                                                                                         | violations |
      | src/core/example.js    | function example() { return new L.Layer(); }                                                    | 1          |
      | src/core/example.js    | typeof L;                                                                                      | 1          |
      | src/core/example.js    | L?.Map;                                                                                        | 1          |
      | src/core/example.js    | object[L];                                                                                     | 1          |
      | src/core/example.js    | import { L } from '../globals/L.js'; function example() { return new L.Layer(); }                | 0          |
      | src/index.js           | import { L } from './globals/L.js'; L.Map.include({});                                           | 0          |
      | src\core\example.js    | import { L } from '../globals/L.js'; L.Map.include({});                                          | 0          |
      | src/core/example.js    | import { L as Leaflet } from '../globals/L.js'; new Leaflet.Layer();                             | 0          |
      | src/core/example.js    | import { L } from './other.js'; new L.Layer();                                                   | 2          |
      | src/core/example.js    | import L from '../globals/L.js'; new L.Layer();                                                  | 2          |
      | src/core/example.js    | import * as L from '../globals/L.js'; new L.Layer();                                             | 2          |
      | src/core/example.js    | function example(L) { return L.Map; }                                                           | 2          |
      | src/core/example.js    | import { L } from '../globals/L.js'; function example(L) { return L.Map; }                       | 1          |
      | src/core/example.js    | import { L } from '../globals/L.js'; function example({ L }) { return L.Map; }                   | 1          |
      | src/core/example.js    | import { L } from '../globals/L.js'; function example(...L) { return L; }                        | 1          |
      | src/core/example.js    | globalThis.L.Map.include({});                                                                   | 1          |
      | src/core/example.js    | window['L'].Map.include({});                                                                    | 1          |
      | src/core/example.js    | window?.['L']?.Map;                                                                             | 1          |
      | src/core/example.js    | self.L.Map.include({});                                                                         | 1          |
      | src/core/example.js    | globalThis.window.L.Map.include({});                                                            | 1          |
      | src/core/example.js    | const root = globalThis; root.L.Map.include({});                                                | 1          |
      | src/core/example.js    | const { L: Leaflet } = window;                                                                  | 1          |
      | src/core/example.js    | Reflect.get(globalThis, 'L').Map.include({});                                                   | 1          |
      | src/core/example.js    | import { L } from '../globals/L.js'; globalThis.L.Map.include({});                               | 1          |
      | src/globals/example.js | export const leaflet = globalThis.L;                                                           | 1          |
      | src/globals/L.js       | export const L = globalThis.L;                                                                  | 0          |
      | src/core/example.js    | const text = 'L.Map and window.L'; /* L.Layer */                                                | 0          |
      | src/core/example.js    | const options = { L: 3 }; object.L;                                                             | 0          |
      | src/core/example.js    | function example() { return { L }; }                                                           | 1          |

  @unit
  Scenario: Source modules import their Leaflet namespace explicitly
    Then source modules access Leaflet only through its explicit global binding

  @unit
  Scenario: Local allocation checks distinguish explicit allocations from primitive calculations
    Then local allocation checks handle these modules:
      | source                                                                               | violations |
      | function update(player) { const deltaX = player.speed * clock.getDelta(); }            | 0          |
      | function update(player) { const targetPosition = { x: 100, y: 200 }; }                 | 1          |
      | function update() { const target = [100, 200]; }                                       | 1          |
      | function update() { const point = new L.Point(100, 200); }                              | 1          |
      | function update() { return { x: 100 }; }                                              | 1          |
      | function update() { consume({ x: 100 }); }                                            | 1          |
      | function update() { target = { x: 100 }; }                                            | 1          |
      | function update(options = {}) {}                                                     | 1          |
      | const update = () => [];                                                             | 1          |
      | const update = function () { return new Map(); };                                     | 1          |
      | class Player { update() { return {}; } }                                              | 1          |
      | function update() { if (ready) { for (;;) { consume({}); break; } } }                   | 1          |
      | function update() { return { points: [new L.Point(0, 0)] }; }                          | 3          |
      | function update() { const { x, y } = player; const [first] = points; }                  | 0          |
      | function update() { return player.position; }                                        | 0          |
      | function update() { const text = 'new Map() and {} and []'; /* return {}; */ }         | 0          |
      | export const state = { points: [], cache: new Map() };                                | 0          |
      | const control = { update() { return []; } };                                          | 1          |

  @unit
  Scenario: Local allocation checks require a separate marker for each necessary allocation
    Then local allocation checks handle these modules:
      | source                                                                                                                                    | violations |
      | function decode() { return /* alloc */ {}; }                                                                                              | 0          |
      | function decode(data) { const view = /* alloc */ new DataView(data); }                                                                     | 0          |
      | function decode() { throw /* alloc */ new Error('Invalid data'); }                                                                        | 0          |
      | function decode() { return /* alloc */ { points: [] }; }                                                                                  | 1          |
      | function decode() { return /* alloc */ { points: /* alloc */ [] }; }                                                                      | 0          |
      | /* alloc */ function update() { return {}; }                                                                                             | 2          |
      | function update() { /* alloc */ const target = {}; }                                                                                     | 2          |
      | function update() { return /* alloc: */ {}; }                                                                                            | 2          |
      | function update() { return /* alloc unknown */ {}; }                                                                                     | 2          |
      | function update() { return /* allocation: required -- Old format. */ {}; }                                                               | 2          |
      | function update() { return /* alloc */ player.position; }                                                                                | 1          |
      | const state = /* alloc */ {};                                                                                                            | 1          |
      | function update() { return {}; } /* alloc */                                                                                             | 2          |
      | function update() { return /* alloc */ /* unrelated */ {}; }                                                                             | 2          |
      | function update() { const text = '/* alloc */'; return {}; }                                                                             | 1          |
      | function update() { return /* Ordinary comments do not authorize an allocation. */ {}; }                                                   | 1          |
      | function update() { return /* alloc */ {}; const other = []; }                                                                           | 1          |

  @unit
  Scenario: Source functions avoid explicit local allocations
    Then source functions allocate no object literals, array literals or constructed instances

  @unit
  Scenario: Header decoding allocates only its owned result, input view and errors
    Then local allocation checks accept source file "src/archives/decodeHeader.js"

  @unit
  Scenario: Directory decoding preallocates its validated entry count and record shape
    Then the PMTiles directory decoder uses a sized array and complete records

  @unit
  Scenario: Sized array checks distinguish preallocation from incremental growth
    Then sized array checks handle these modules:
      | source                                      | violations |
      | const values = [];                          | 1          |
      | const values = [0, 0, 0];                   | 0          |
      | const values = new Array(count);            | 0          |
      | const values = Array(count);                | 0          |
      | const values = new Array();                 | 1          |
      | const values = Array();                     | 1          |
      | values.push(value);                         | 1          |
      | values['unshift'](value);                   | 1          |
      | values.splice(0, 0, value);                 | 1          |
      | values[i] = value;                          | 0          |
      | const text = '[] and values.push(value)';   | 0          |

  @unit
  Scenario Outline: Known-size geometry and lighting arrays do not grow incrementally
    Then source file "<file>" avoids unsized arrays and array growth methods

    Examples:
      | file                            |
      | src/geometry/createLampRing.js   |
      | src/geometry/createTreeRing.js   |
      | src/geometry/subtractVector.js   |
      | src/geometry/computeBounds.js    |
      | src/lighting/cacheLightGrid.js   |

  @unit
  Scenario Outline: Sky projection and atmosphere justify every necessary local allocation
    Then local allocation checks accept source file "<file>"

    Examples:
      | file                                    |
      | src/projections/projectCelestialBody.js |
      | src/sunlight/updateSky.js                |
      | src/sunlight/onAddSun.js                 |
      | src/sunlight/atmosphere.js               |
      | src/colors/mixColor.js                   |
      | src/colors/formatRGB.js                  |
      | src/astronomy/solarTime.js               |
      | src/astronomy/solarPosition.js           |
      | src/astronomy/moonPosition.js            |
      | src/astronomy/horizontalPosition.js      |
      | src/sunlight/initializeTimeControl.js    |
      | src/sunlight/updateSun.js                |
      | src/sunlight/useSelectedTime.js          |
      | src/sunlight/removeSun.js                |
      | src/sunlight/addTimeLayer.js             |
      | src/sunlight/addTimeControlToMap.js       |
      | src/sunlight/initSunlight.js             |
      | src/sunlight/onAddTimeControl.js          |
      | src/sunlight/removeTimeControl.js        |
      | src/sunlight/removeTimeLayer.js          |
      | src/sunlight/requestSunlightRender.js    |
      | src/sunlight/styleTimeControl.js         |
      | src/sunlight/tickSun.js                  |
      | src/sunlight/useLiveTime.js              |

  @unit
  Scenario Outline: Archive modules justify every necessary local allocation
    Then local allocation checks accept source file "<file>"

    Examples:
      | file                            |
      | src/archives/decodeDirectory.js  |
      | src/archives/readVarint.js       |
      | src/archives/tileId.js           |
      | src/archives/decompress.js       |
      | src/archives/getZxy.js           |
      | src/archives/getHeader.js        |
      | src/archives/readArchiveRange.js |
      | src/archives/loadDirectory.js    |
      | src/archives/loadSource.js       |

  @unit
  Scenario: JSDoc checks associate documentation with declarations
    Then source documentation checks handle these modules:
      | source                                                       | violations |
      | /** Description. */ export function run() {}                 | 0          |
      | export /** Description. */ function run() {}                 | 0          |
      | export function run() {}                                     | 1          |
      | function run() {}                                            | 1          |
      | /* Ordinary comment. */ export function run() {}             | 1          |
      | /** */ export function run() {}                              | 1          |
      | /** Unrelated. */ const other = 1; export function run() {}  | 1          |
      | /** Description. */ export const value = 1;                  | 0          |
      | export const value = 1;                                       | 1          |
      | /** Description. */ const value = 1; export { value };        | 0          |
      | const value = 1; /** Description. */ export { value };        | 0          |
      | const value = 1; export { value };                            | 1          |
      | const value = 1; export { value as renamed };                 | 1          |
      | const value = 1; export default value;                        | 1          |
      | /** Description. */ const value = 1; export default value;    | 0          |
      | /** Description. */ export { value } from './other.js';       | 0          |
      | export { value } from './other.js';                           | 0          |
      | export * from './other.js';                                   | 0          |
      | import { value } from './other.js'; export { value };        | 0          |
      | import { value } from './other.js'; /** Description. */ export { value }; | 0 |
      | import value from './other.js'; export default value;          | 0          |
      | export default 1;                                             | 1          |
      | /** Description. */ export default 1;                         | 0          |
      | /** Description. */ export default function () {}             | 0          |
      | /** Description. */ const run = () => 1;                    | 0          |
      | class Example { method() {} }                                | 1          |
      | class Example { /** Description. */ method() {} }             | 0          |
      | /** File description. */ import './side-effect.js';          | 0          |
      | import './side-effect.js';                                  | 0          |

  @unit
  Scenario: JSDoc tags cover parameters, returns, throws and exported variables
    Then source documentation tag checks handle these modules:
      | source                                                                                           | violations |
      | /** Runs. @param {number} x @returns {number} value */ function run(x) { return x; }             | 0          |
      | /** Runs. */ function run(x) { return x; }                                                       | 2          |
      | /** Runs. @param {number} other @returns {number} value */ function run(x) { return x; }         | 1          |
      | /** Runs. @param {number} [x=1] */ function run(x = 1) {}                                        | 0          |
      | /** Runs. @param {...number} values */ function run(...values) {}                                | 0          |
      | /** Runs. @param {Object} options @param {number} x */ function run({ a }, x) {}                | 0          |
      | /** Runs. @param {number} x */ function run({ a }, x) {}                                        | 1          |
      | /** Runs. @returns {number} value */ const run = () => 1;                                         | 0          |
      | /** Runs. */ function run() { return; }                                                           | 0          |
      | /** Runs. */ async function run() {}                                                             | 1          |
      | /** Runs. */ function* run() {}                                                                  | 1          |
      | /** Runs. @throws {Error} failed */ function run() { throw new Error(); }                        | 0          |
      | /** Runs. */ function run() { throw new Error(); }                                                | 1          |
      | /** Runs. @throws {Error} failed */ function run() { if (x) throw 1; throw 2; }                 | 1          |
      | /** Runs. @returns */ function run() { return 1; }                                               | 1          |
      | /** Runs. @param {number} options.value */ function run(options) {}                              | 1          |
      | /** Runs. */ function run() { function nested() { throw 1; return 2; } }                         | 1          |
      | /** Value. @type {number} */ export const value = 1;                                             | 0          |
      | /** Value. @type {{a: {b: number}}} */ export const value = {};                                 | 0          |
      | /** Value. */ export const value = 1;                                                            | 1          |
      | /** Value. @type { } */ export const value = 1;                                                 | 1          |
      | const value = 1; /** Value. @type {number} */ export { value };                                 | 0          |
      | /** Value. @type {number} */ export default 1;                                                    | 0          |
      | /** Value. */ export default 1;                                                                  | 1          |
      | export { value } from './other.js';                                                              | 0          |
      | import value from './other.js'; export default value;                                            | 0          |

  @unit
  Scenario: JSDoc sections and functions have consistent spacing
    Then source documentation spacing checks handle these modules:
      | source                                                                                                                                                | violations |
      | /** Runs.\n *\n * @param {number} x\n * @param {number} y\n *\n * @returns {number} result\n *\n * @throws {Error} failure\n */\nexport function run(x, y) {} | 0 |
      | /** Runs.\n * @param {number} x\n */\nfunction run(x) {}                                                                                             | 1 |
      | /** Runs.\n *\n * @param {number} x\n * @returns {number} result\n */\nfunction run(x) {}                                                             | 1 |
      | /** Runs.\n *\n * @return {number} result\n * @throws {Error} failure\n */\nfunction run() {}                                                        | 1 |
      | /** Runs.\n *\n * @return {number} result\n *\n * @throws {Error} failure\n * @throws {Error} other\n */\nfunction run() {}                          | 0 |
      | /** Runs.\n *\n *\n * @param {number} x\n */\nfunction run(x) {}                                                                                    | 1 |
      | /** Runs. @param {number} x */ function run(x) {}                                                                                                     | 1 |
      | /** Value.\n *\n * @type {number}\n */\nexport const value = 1;                                                                                       | 0 |
      | /** Value.\n * @type {number}\n */\nexport const value = 1;                                                                                          | 1 |
      | /** Runs. */\n\nfunction run() {}                                                                                                                    | 1 |
      | /** Runs. */\n \nexport function run() {}                                                                                                            | 1 |
      | export /** Runs. */\n\nfunction run() {}                                                                                                             | 1 |
      | /** Runs. */\n\nconst run = () => 1;                                                                                                                 | 1 |
      | class Example {\n /** Runs. */\n\n method() {}\n}                                                                                                    | 1 |
      | /** Runs. */\nfunction run() {}                                                                                                                      | 0 |
      | /** Runs. */ function run() {}                                                                                                                       | 0 |
      | export { value } from './other.js';                                                                                                                  | 0 |

  @unit
  Scenario: Documented source files follow JSDoc spacing rules
    Then documented source files follow JSDoc spacing rules

  @unit
  Scenario: Animation and interaction modules document their arguments and results
    Then JSDoc tag checks accept source directory "src/animations"
    And JSDoc tag checks accept source directory "src/walk"
    And JSDoc tag checks accept source directory "src/traffic"
    And JSDoc tag checks accept source directory "src/vehicles"
    And JSDoc tag checks accept source directory "src/gpu"
    And JSDoc tag checks accept source directory "src/utils"
    And JSDoc tag checks accept source directory "src/camera"
    And JSDoc tag checks accept source directory "src/models"
    And JSDoc tag checks accept source directory "src/sources"
    And JSDoc tag checks accept source directory "src/scene"
    And JSDoc tag checks accept source directory "src/core"

  @unit
  Scenario: Rendering modules document their arguments and results
    Then JSDoc tag checks accept source directory "src/colors"
    And JSDoc tag checks accept source directory "src/materials"
    And JSDoc tag checks accept source directory "src/astronomy"
    And JSDoc tag checks accept source directory "src/shaders"
    And JSDoc tag checks accept source directory "src/shadows"
    And JSDoc tag checks accept source directory "src/layer-controls"
    And JSDoc tag checks accept source directory "src/lighting"
    And JSDoc tag checks accept source directory "src/rendering"
    And JSDoc tag checks accept source directory "src/textures"
    And JSDoc tag checks accept source directory "src/raster"

  @unit
  Scenario: Geometry and worker modules document their arguments and results
    Then JSDoc tag checks accept source directory "src/triangulation"
    And JSDoc tag checks accept source directory "src/archives"
    And JSDoc tag checks accept source directory "src/terrain"
    And JSDoc tag checks accept source directory "src/sunlight"
    And JSDoc tag checks accept source directory "src/picking"
    And JSDoc tag checks accept source directory "src/workers"
    And JSDoc tag checks accept source directory "src/projections"
    And JSDoc tag checks accept source directory "src/transforms"
    And JSDoc tag checks accept source directory "src/collision"

  @unit
  Scenario: Source files document functions and exports with JSDoc
    Then every source file documents its functions and exported variables with JSDoc

  @unit
  Scenario: Sources avoid closures and functional iteration
    Then no source file defines arrows, nested functions or callback array methods

  @unit
  Scenario: Function checks reject module-level arrow functions
    Then source function checks handle these modules:
      | source                                        | violations |
      | function mirror(x) { return x; }               | 0          |
      | export function mirror(x) { return x; }        | 0          |
      | const mirror = (x) => x;                       | 1          |
      | export const mirror = (x) => { return x; };    | 1          |
      | const mirror = async (x) => x;                 | 1          |
      | const obj = { mirror: (x) => x };              | 1          |
      | function outer() { function inner() {} }       | 1          |
      | values.filter(predicate);                     | 1          |
      | const text = 'const mirror = (x) => x';        | 0          |

  @unit
  Scenario: Export counting cannot be bypassed with grouped declarations
    Then source export counting handles these modules:
      | source                                              | count    |
      | const value = 1;                                     | 0        |
      | export default function () {}                        | 1        |
      | export function first() {} export class Second {}    | 2        |
      | const a = 1, b = 2; export { a, b };                   | 2        |
      | export const a = 1, b = 2;                            | 2        |
      | export const { a, b: renamed, ...rest } = {};         | 3        |
      | export const [a, , b = 1, ...rest] = [];               | 3        |
      | export { first, second } from './other.js';           | 2        |
      | export * as group from './other.js';                 | 1        |
      | export * from './other.js';                          | Infinity |

  @unit
  Scenario: Source modules expose at most one export
    Then each source file exports at most one binding

  @unit
  Scenario: Function counting includes private helpers and methods
    Then source function counting handles these modules:
      | source                                              | count |
      | const value = 1;                                     | 0     |
      | export function first() {}                           | 1     |
      | function first() {} function second() {}              | 2     |
      | function outer() { function inner() {} }              | 2     |
      | const first = function () {}; const second = () => 1; | 2     |
      | const object = { first() {}, second() {} };           | 2     |
      | class Example { constructor() {} method() {} }        | 2     |
      | async function first() {} function* second() {}       | 2     |
      | const text = 'function first() {}';                   | 0     |
      | /* function ignored() {} */ function first() {}       | 1     |

  @unit
  Scenario: Source modules define at most one function
    Then each source file defines at most one function

  @unit
  Scenario: Module variable checks enforce one global per dedicated module
    Then module variable checks handle these files:
      | file                         | source                                                    | violations |
      | src/geometry/example.js      | const HEIGHT = 8;                                         | 1          |
      | src/geometry/example.js      | export const HEIGHT = 8;                                  | 1          |
      | src/globals/HEIGHT.js        | export const HEIGHT = 8;                                  | 0          |
      | src/globals/HEIGHT.js        | const HEIGHT = 8; export { HEIGHT };                      | 0          |
      | src/weakmaps/directoriesByLayer.js | export const directoriesByLayer = new WeakMap();      | 0          |
      | src/weakmaps/example.js      | export const other = new WeakMap();                      | 1          |
      | src\globals\HEIGHT.js        | export const HEIGHT = 8;                                  | 0          |
      | src/state.js                 | const state = {};                                         | 1          |
      | src/state.js                 | export let state = {};                                    | 1          |
      | src/state.js                 | export const other = {};                                  | 1          |
      | src/state.js                 | export const state = {}, other = {};                      | 1          |
      | src/state.js                 | export const { state } = {};                              | 1          |
      | src/globals/HEIGHT.js        | export const other = 8;                                   | 1          |
      | src/globals/HEIGHT.js        | export const HEIGHT = 8, WIDTH = 4;                       | 1          |
      | src/globals/HEIGHT.js        | export let HEIGHT = 8;                                    | 1          |
      | src/globals/HEIGHT.js        | const HEIGHT = 8;                                         | 1          |
      | src/constants/HEIGHT.js      | export const HEIGHT = 8;                                  | 1          |
      | src/state/count.js           | export let count = 0;                                     | 1          |
      | src/geometry/example.js      | function example() { const HEIGHT = 8; let count = 0; }    | 0          |
      | src/geometry/example.js      | import { state } from '../state.js';                       | 0          |
      | src/geometry/example.js      | if (true) { const HEIGHT = 8; }                           | 1          |

  @unit
  Scenario: Module variables live in dedicated global modules
    Then module constants and state use dedicated global modules

  @unit
  Scenario: Directory depth checks reject all nested source folders
    Then source directory checks handle these folders:
      | directory                 | violations |
      | src                       | 0          |
      | src/constants             | 0          |
      | src/state                 | 0          |
      | src/geometry              | 0          |
      | src/constants/            | 0          |
      | src/foo/constants         | 1          |
      | src/bar/state             | 1          |
      | src/scene/camera           | 1          |
      | src/scene/camera/controls  | 1          |
      | src\constants             | 0          |
      | src\foo\constants         | 1          |

  @unit
  Scenario: Source directories have only one level below src
    Then source directories are direct children of src

  @unit
  Scenario: Loop declarations are rejected while predeclared local variables are allowed
    Then loop declaration checks handle these modules:
      | source                                                                                  | violations |
      | function f() { const value = 1; return value; }                                           | 0          |
      | function f() { let i, value; for (i = 0; i < 2; i++) { value = i; } }                       | 0          |
      | function f() { let value; for (value of values) {} }                                      | 0          |
      | function f() { let key; for (key in values) {} }                                          | 0          |
      | function f() { let a, b; while (ready) { [a, b] = values; } }                              | 0          |
      | function f() { for (let i = 0; i < 2; i++) {} }                                           | 1          |
      | function f() { for (const value of values) {} }                                          | 1          |
      | function f() { for (var key in values) {} }                                              | 1          |
      | async function f() { for await (const value of values) {} }                              | 1          |
      | async function f() { let value; for await (value of values) {} }                         | 0          |
      | function f() { while (ready) { const value = 1; } }                                      | 1          |
      | function f() { do { let value; } while (ready); }                                        | 1          |
      | function f() { for (;;) { if (ready) { var value = 1; } break; } }                        | 1          |
      | function f() { while (ready) { const { a, b } = values; } }                              | 1          |
      | function f() { while (ready) { for (let i = 0; i < 2; i++) { let value; } } }             | 2          |
      | function f() { let i; for (i = 0; i < 2; i++) {} const value = 1; }                       | 0          |
      | function f() { return 'while (ready) { let value; }'; /* for (let i = 0;;) {} */ }        | 0          |

  @unit
  Scenario: Source loops contain no variable declarations
    Then source loops declare no variables in their headers or bodies

  @unit
  Scenario: Sequential header loops reuse one local counter
    Then the PMTiles header decoder reuses one counter across its three loops

  @unit
  Scenario: Standalone scopes cannot bypass loop variable reuse
    Then standalone scope checks handle these modules:
      | source                                                                                              | violations |
      | function f() { let i; for (i = 0; i < 2; i++) {} for (i = 0; i < 3; i++) {} }                         | 0          |
      | function f() { { let i; for (i = 0; i < 2; i++) {} } }                                               | 1          |
      | function f() { { let i; for (i = 0; i < 2; i++) {} } { let i; for (i = 0; i < 3; i++) {} } }         | 2          |
      | { let i; for (i = 0; i < 2; i++) {} }                                                               | 1          |
      | function f() { {} }                                                                                 | 1          |
      | function f() { { {} } }                                                                             | 2          |
      | function f() { scope: { let i; for (i = 0; i < 2; i++) {} } }                                         | 1          |
      | function f() { if (ready) { {} } }                                                                  | 1          |
      | function f() { if (ready) { run(); } else { stop(); } }                                              | 0          |
      | function f() { while (ready) { run(); } do { run(); } while (ready); }                                | 0          |
      | function f() { try { run(); } catch (error) { report(error); } finally { stop(); } }                  | 0          |
      | function f() { switch (value) { case 1: { run(); break; } } }                                        | 1          |
      | function f() { switch (value) { case 1: run(); break; } }                                            | 0          |
      | function f() { let i; outer: for (i = 0; i < 2; i++) { if (ready) break outer; } }                    | 0          |
      | class Example { method() { return {}; } static {} }                                                 | 0          |
      | function f() { return '{ let i; for (i = 0; i < 2; i++) {} }'; /* {} */ }                            | 0          |

  @unit
  Scenario: Source files do not introduce standalone scopes
    Then source files contain no standalone block scopes
