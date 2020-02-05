import { serializeArray, deserializeArray } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize array', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeArray(source)).toThrow(exception)
    } else {
      const actual = serializeArray(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize array', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => deserializeArray(source.serialized, source.itemCount)).toThrow(exception)
    } else {
      const actual = deserializeArray(source.serialized, source.itemCount)
      expect(actual).toEqual(expected)
    }
  })
})
