/**
 * Sun elevation stops with sky, horizon and light colors for atmospheric interpolation.
 *
 * @type {Array}
 */
export const atmosphereStops = [
  [-18, [3, 7, 20],
    [17, 28, 54],
    [0.025, 0.04, 0.09]
  ],
  [-6, [37, 53, 84],
    [182, 106, 86],
    [0.12, 0.10, 0.14]
  ],
  [0, [101, 131, 171],
    [246, 170, 115],
    [0.38, 0.24, 0.18]
  ],
  [10, [74, 147, 208],
    [197, 221, 237],
    [0.80, 0.75, 0.68]
  ],
  [25, [53, 144, 213],
    [223, 238, 250],
    [1, 1, 1]
  ],
];
