import Molecule, {
  isByteSchema,
  isArraySchema,
  isDynvecSchema,
  isFixvecSchema,
  isOptionSchema,
  isUnionSchema,
  isStructSchema,
  isTableSchema,
} from '.'
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

describe('Test helpers', () => {
  it('Byte Schema Assertion', () => {
    expect(isByteSchema({ type: 'byte' })).toBe(true)
    expect(isArraySchema({ type: 'array' })).toBe(true)
    expect(isStructSchema({ type: 'struct' })).toBe(true)
    expect(isFixvecSchema({ type: 'fixvec' })).toBe(true)
    expect(isDynvecSchema({ type: 'dynvec' })).toBe(true)
    expect(isTableSchema({ type: 'table' })).toBe(true)
    expect(isUnionSchema({ type: 'union' })).toBe(true)
    expect(isOptionSchema({ type: 'option' })).toBe(true)
  })
})
