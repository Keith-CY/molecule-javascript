import { serializeUnion, deserializeUnion } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize table', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeUnion(source)).toThrow(exception)
    } else {
      const actual = serializeUnion(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize table', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => deserializeUnion(source.serialized, source.indices)).toThrow(exception)
    } else {
      const actual = deserializeUnion(source.serialized, source.indices)
      expect(actual).toEqual(expected)
    }
  })
})
