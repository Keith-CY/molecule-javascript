/* eslint-disable import/extensions */
import { serializeTable, deserializeTable } from '.'

const { serialize: serializeFixture, deserialize: deserializeFixture } = require('./fixture.json')

describe('Test serialize table', () => {
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
      expect(() => serializeTable(source)).toThrow(exception)
    } else {
      const actual = serializeTable(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize table', () => {
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
      expect(() => deserializeTable(source.serialized, source.sizes)).toThrow(exception)
    } else {
      const actual = deserializeTable(source.serialized, source.sizes)
      expect(actual).toEqual(expected)
    }
  })
})
