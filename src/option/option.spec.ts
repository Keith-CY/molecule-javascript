/* eslint-disable import/extensions */
import { serializeOption, deserializeOption } from '.'

const { serialize: serializeFixture, deserialize: deserializeFixture } = require('./fixture.json')

describe('Test serialize option', () => {
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
      expect(() => serializeOption(source)).toThrow(exception)
    } else {
      const actual = serializeOption(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize option', () => {
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
      expect(() => deserializeOption(source.serialized, source.sizes)).toThrow(exception)
    } else {
      const actual = deserializeOption(source.serialized, source.sizes)
      expect(actual).toEqual(expected)
    }
  })
})
