/* eslint-disable import/extensions */
import { serializeArray } from '.'

const { serialize: serializeFixture } = require('./fixture.json')

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
