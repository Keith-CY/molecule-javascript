/* eslint-disable import/extensions */
import { serializeFixvec, deserializeFixvec } from '.'

const { serialize: serializeFixture, deserialize: deserializeFixture } = require('./fixture.json')

describe('Test serialize fixvec', () => {
  const fixtureTable: [
    any[],
    string | undefined,
    string | undefined,
  ][] = serializeFixture.map(
    ({ source, expected, exception }: { source: any[]; expected?: string; exception?: string }) => [
      source,
      expected,
      exception,
    ],
  )

  test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
    if (exception) {
      expect(() => serializeFixvec(source)).toThrow(exception)
    } else {
      const actual = serializeFixvec(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize fixvec', () => {
  const fixtureTable: [
    string,
    string[] | undefined,
    string | undefined,
  ][] = deserializeFixture.map(
    ({ source, expected, exception }: { source: string; expected?: string[]; exception?: string }) => [
      source,
      expected,
      exception,
    ],
  )

  test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
    if (exception) {
      expect(() => deserializeFixvec(source)).toThrow(exception)
    } else {
      const actual = deserializeFixvec(source)
      expect(actual).toEqual(expected)
    }
  })
})
