/* eslint-disable import/extensions */
import { serializeStruct, deserializeStruct } from '.'

const { serialize: serializeFixture, deserialize: deserializeFixture } = require('./fixture.json')

describe('Test serialize struct', () => {
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
      expect(() => serializeStruct(source)).toThrow(exception)
    } else {
      const actual = serializeStruct(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize struct', () => {
  const fixtureTable: [
    { serialized: string; sizes: [string, number][] },
    string | undefined,
    string | undefined,
  ][] = deserializeFixture.map(
    ({
      source,
      expected,
      exception,
    }: {
      source: { serialized: string; sizes: [string, number][] }
      expected?: string
      exception?: string
    }) => [source, expected, exception],
  )

  test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
    if (exception) {
      expect(() => deserializeStruct(source.serialized, source.sizes)).toThrow(exception)
    } else {
      const actual = deserializeStruct(source.serialized, source.sizes)
      expect(actual).toEqual(expected)
    }
  })
})
