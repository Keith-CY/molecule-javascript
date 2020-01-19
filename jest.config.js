module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@sr,c/(.,*)$': '<rootDir>/src/$1',
  },
}
