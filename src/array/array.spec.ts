/* eslint-disable import/extensions */
import { serializeArray, deserializeArray } from '.'

const { serialize: serializeFixture, deserialize: deserializeFixture } = require('./fixture.json')

describe('Test serialize array', () => {
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
      expect(() => serializeArray(source)).toThrow(exception)
    } else {
      const actual = serializeArray(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize array', () => {
  const fixtureTable: [
    { serialized: string; sizes: number[] },
    string[] | undefined,
    string | undefined,
  ][] = deserializeFixture.map(
    ({
      source,
      expected,
      exception,
    }: {
      source: { serialized: string; sizes: number[] }
      expected?: string[]
      exception?: string
    }) => [source, expected, exception],
  )

  test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
    if (exception) {
      expect(() => deserializeArray(source.serialized, source.sizes)).toThrow(exception)
    } else {
      const actual = deserializeArray(source.serialized, source.sizes)
      expect(actual).toEqual(expected)
    }
  })
})
