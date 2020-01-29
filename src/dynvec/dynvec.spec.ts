import { serializeDynvec, deserializeDynvec } from '.'
import { serialize as serializeFixture, deserialize as deserializeFixture } from './fixture.json'

describe('Test serialize dynvec', () => {
  const fixtureTable = serializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source: any, expected: any, exception: any) => {
    if (exception) {
      expect(() => serializeDynvec(source)).toThrow(exception)
    } else {
      const actual = serializeDynvec(source)
      expect(actual).toBe(expected)
    }
  })
})

describe('Test deserialize dynvec', () => {
  const fixtureTable = deserializeFixture.map(({ source, expected, exception }) => [source, expected, exception])

  test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
    if (exception) {
      expect(() => deserializeDynvec(source as string)).toThrow(exception as string)
    } else {
      const actual = deserializeDynvec(source as string)
      expect(actual).toEqual(expected)
    }
  })
})
