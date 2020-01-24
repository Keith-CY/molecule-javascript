/* eslint-disable import/extensions */
import { serializeDynvec, deserializeDynvec } from '.'

const { serialize: serializeFixture, deserialize: deserializeFixture } = require('./fixture.json')

describe('Test serialize dynvec', () => {
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
      expect(() => serializeDynvec(source)).toThrow(exception)
    } else {
      const actual = serializeDynvec(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize dynvec', () => {
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
      expect(() => deserializeDynvec(source)).toThrow(exception)
    } else {
      const actual = deserializeDynvec(source)
      expect(actual).toEqual(expected)
    }
  })
})
