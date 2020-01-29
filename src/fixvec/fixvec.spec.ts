import { serializeFixvec, deserializeFixvec } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize fixvec', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeFixvec(source)).toThrow(exception)
    } else {
      const actual = serializeFixvec(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize fixvec', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => deserializeFixvec(source)).toThrow(exception)
    } else {
      const actual = deserializeFixvec(source)
      expect(actual).toEqual(expected)
    }
  })
})
