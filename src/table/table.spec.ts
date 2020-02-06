import { serializeTable, deserializeTable } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize table', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }: any) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeTable(source)).toThrow(exception)
    } else {
      const actual = serializeTable(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize table', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => deserializeTable(source.serialized, source.keys)).toThrow(exception)
    } else {
      const actual = deserializeTable(source.serialized, source.keys)
      expect(actual).toEqual(expected)
    }
  })
})
