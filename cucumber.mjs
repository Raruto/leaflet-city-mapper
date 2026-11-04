import { availableParallelism } from 'node:os';

export default {
    paths: ['test/features/**/*.feature'],
    import: ['test/support/**/*.js', 'test/steps/**/*.js'],
    format: ['progress'],
    parallel: 1, // availableParallelism(),
    failFast: true,
};
