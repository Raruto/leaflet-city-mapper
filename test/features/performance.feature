Feature: Performance-oriented source style
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
  Scenario: Module variable checks enforce exported constants and state
    Then module variable checks handle these files:
      | file                         | source                                                    | violations |
      | src/geometry/example.js      | const HEIGHT = 8;                                         | 1          |
      | src/geometry/example.js      | export const HEIGHT = 8;                                  | 1          |
      | src/constants/HEIGHT.js      | export const HEIGHT = 8;                                  | 0          |
      | src/constants/HEIGHT.js      | const HEIGHT = 8; export { HEIGHT };                       | 0          |
      | src/constants/HEIGHT.js      | const HEIGHT = 8;                                         | 1          |
      | src/state/count.js           | export let count = 0;                                     | 0          |
      | src/state/count.js           | let count = 0;                                            | 1          |
      | src/constants/count.js       | export let count = 0;                                     | 1          |
      | src/state/HEIGHT.js          | export const HEIGHT = 8;                                  | 1          |
      | src/constants/HEIGHT.js      | export var HEIGHT = 8;                                    | 1          |
      | src/constants/HEIGHT.js      | export const { height: HEIGHT = 8 } = {};                  | 0          |
      | src/geometry/example.js      | function example() { const HEIGHT = 8; let count = 0; }    | 0          |
      | src/geometry/example.js      | import { HEIGHT } from '../constants/HEIGHT.js';           | 0          |
      | src/geometry/example.js      | if (true) { const HEIGHT = 8; }                           | 1          |

  @unit
  Scenario: Module variables live in dedicated constants and state folders
    Then module constants and state are exported from their dedicated folders

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
