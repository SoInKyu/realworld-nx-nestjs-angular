module.exports = {
  displayName: 'user-api-shared',
  preset: '../../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/user/api/shared',
  coverageThreshold: {
    global: {
      branches: 50,
      lines: 50,
      functions: 50,
      statements: 50,
    },
  },
};
