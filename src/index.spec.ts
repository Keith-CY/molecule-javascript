import Molecule from '.'
import { serialize as serializeFixture } from './fixture.json'

describe('Test Molecule serialzie', () => {
  const fixtureTable = serializeFixture.map(({ schema, value, expected }) => [schema, value, expected])

  test.each(fixtureTable)(`%s => %s ? %s`, (schema: any, value, expected) => {
    const molecule = new Molecule(schema)
    const actual = molecule.serialize(value)
    expect(actual).toBe(expected)
  })
})
