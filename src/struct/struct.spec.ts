import { serializeStruct, deserializeStruct } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize struct', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeStruct(source)).toThrow(exception)
    } else {
      const actual = serializeStruct(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize struct', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }: any) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => deserializeStruct(source.serialized, source.sizes)).toThrow(exception)
    } else {
      const actual = deserializeStruct(source.serialized, source.sizes)
      expect(actual).toEqual(expected)
    }
  })
})
