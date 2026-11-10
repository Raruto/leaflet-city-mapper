export default {
    paths: ['test/features/**/*.feature'],
    import: ['test/fixtures/leaflet.js', 'test/support/**/*.js', 'test/steps/**/*.js'],
    format: ['progress'],
    parallel: 0,
    failFast: false,
};
