import { uint16Le, uint32Le, uint64Le, fromUintLe } from '.'
import {
  uint16Le as uint16LeFixture,
  uint32Le as uint32LeFixture,
  uint64Le as uint64LeFixture,
  fromUintLe as fromUintLeFixture,
} from './fixture.json'

type Fixture = Readonly<{
  source: any
  expected?: string
  exception?: string
}>

type FixtureArgs = Readonly<[any, string | undefined, string | undefined]>

describe('Test uint => le', () => {
  describe('Test uint16Le', () => {
    const fixtureTable: FixtureArgs[] = uint16LeFixture.map(({ source, expected, exception }: Fixture) => [
      source,
      expected,
      exception,
    ])
    test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
      if (exception) {
        expect(() => uint16Le(source)).toThrow(exception)
      } else {
        const actual = uint16Le(source)
        expect(actual).toBe(expected)
      }
    })
  })

  describe('Test uint32Le', () => {
    const fixtureTable: FixtureArgs[] = uint32LeFixture.map(({ source, expected, exception }: Fixture) => [
      source,
      expected,
      exception,
    ])
    test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
      if (exception) {
        expect(() => uint16Le(source)).toThrow(exception)
      } else {
        const actual = uint32Le(source)
        expect(actual).toBe(expected)
      }
    })
  })

  describe('Test uint64Le', () => {
    const fixtureTable: FixtureArgs[] = uint64LeFixture.map(({ source, expected, exception }: Fixture) => [
      source,
      expected,
      exception,
    ])
    test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
      if (exception) {
        expect(() => uint16Le(source)).toThrow(exception)
      } else {
        const actual = uint64Le(source)
        expect(actual).toBe(expected)
      }
    })
  })

  describe('Test fromUintLe', () => {
    const fixtureTable: FixtureArgs[] = fromUintLeFixture.map(({ source, expected, exception }: Fixture) => [
      source,
      expected,
      exception,
    ])
    test.each(fixtureTable)(`%s => %s ? %s`, (source, expected, exception) => {
      if (exception) {
        expect(() => fromUintLe(source)).toThrow(exception)
      } else {
        const actual = fromUintLe(source)
        expect(actual).toBe(expected)
      }
    })
  })
})
