import { serializeOption, deserializeOption } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize option', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeOption(source)).toThrow(exception)
    } else {
      const actual = serializeOption(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize option', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => deserializeOption(source.serialized)).toThrow(exception)
    } else {
      const actual = deserializeOption(source.serialized)
      expect(actual).toEqual(expected)
    }
  })
})
