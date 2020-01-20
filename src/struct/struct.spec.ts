/* eslint-disable import/extensions */
import { serializeStruct } from '.'

const { serialize: serializeFixture } = require('./fixture.json')

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
