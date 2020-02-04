import Molecule from '.'
import { serialize as serializeFixture } from './fixture_serialize.json'
import { deserialize as deserializeFixture } from './fixture_deserialize.json'

describe('Test Molecule serialize', () => {
  const fixtureTable = serializeFixture.map(({ schema, value, expected }) => [schema, value, expected])

  test.each(fixtureTable)(`%s => %s ? %s`, (schema: any, value, expected) => {
    const molecule = new Molecule(schema)
    const actual = molecule.serialize(value)
    expect(actual).toBe(expected)
  })
})

describe('Test Molecule deserialize', () => {
  const fixtureTable = deserializeFixture.map(({ schema, value, expected }) => [schema, value, expected])
  test.each(fixtureTable)(`%s => %s ? %s`, (schema: any, value, expected) => {
    const molecule = new Molecule(schema)
    const actual = molecule.deserialize(value as string)
    expect(actual).toEqual(expected)
  })
})
