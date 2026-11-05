import { availableParallelism } from 'node:os';

export default {
    paths: ['test/features/**/*.feature'],
    import: ['test/fixtures/leaflet.js', 'test/support/**/*.js', 'test/steps/**/*.js'],
    format: ['progress'],
    parallel: 1, // availableParallelism(),
    failFast: false,
};
