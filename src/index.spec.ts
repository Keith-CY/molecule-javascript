import {
  Molecule,
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
  it('Get Basic Types', () => {
    expect(Molecule.getBasicTypes()).toEqual([
      'byte',
      'array',
      'fixvec',
      'dynvec',
      'option',
      'union',
      'struct',
      'table',
    ])
  })

  it('Get schema', () => {
    const schema = {
      name: 'array > array > array',
      type: 'array' as any,
      item: {
        name: 'array > array',
        type: 'array' as any,
        item: {
          name: 'array',
          type: 'array' as any,
          itemCount: 3,
        },
        itemCount: 3,
      },
      itemCount: 2,
    }
    const molecule = new Molecule(schema)
    expect(molecule.getSchema()).toEqual(schema)
  })
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

  it('Invalid schema should throw an error', () => {
    expect(() => new Molecule('schema' as any)).toThrow('Schema is invalid')
  })
  it('Schema has invalid types should throw an error', () => {
    const schema: any = {
      name: 'Invalid Schema',
      type: 'Word',
    }
    expect(() => new Molecule(schema)).toThrow('Schema has invalid type')
  })
  it('array type lack of item count should throw an error', () => {
    const schema: any = {
      name: 'Invalid Array',
      type: 'array',
    }

    expect(() => new Molecule(schema)).toThrow('ArraySchema must have itemCount')
  })
})
