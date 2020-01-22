/* eslint-disable import/extensions */
import { serializeUnion, deserializeUnion } from '.'

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
      expect(() => serializeUnion(source)).toThrow(exception)
    } else {
      const actual = serializeUnion(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize table', () => {
  const fixtureTable: [
    { serialized: string; indices: [string, number][] },
    string | undefined,
    string | undefined,
  ][] = deserializeFixture.map(
    ({
      source,
      expected,
      exception,
    }: {
      source: { serialized: string; indices: [string, number][] }
      expected?: string
      exception?: string
    }) => [source, expected, exception],
  )

  test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
    if (exception) {
      expect(() => deserializeUnion(source.serialized, source.indices)).toThrow(exception)
    } else {
      const actual = deserializeUnion(source.serialized, source.indices)
      expect(actual).toEqual(expected)
    }
  })
})
