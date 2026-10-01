/** @type {import('jest').Config} */
const base = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  testEnvironment: 'node',
  // main.ts loads it first; class-transformer and Nest rely on it.
  setupFiles: ['reflect-metadata'],
};

module.exports = {
  projects: [
    // Unit: next to the code, no I/O.
    { ...base, displayName: 'unit', rootDir: 'src', testRegex: '.*\\.spec\\.ts$' },
    // Integration: boots Nest roles; from T02 on — against a real Postgres.
    { ...base, displayName: 'integration', rootDir: 'test', testRegex: '.*\\.int-spec\\.ts$' },
  ],
  coverageDirectory: 'coverage',
};
