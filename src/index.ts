import { serializeArray, deserializeArray } from './array'
import { serializeFixvec, deserializeFixvec } from './fixvec'
import { serializeDynvec, deserializeDynvec } from './dynvec'
import { serializeOption, deserializeOption } from './option'
import { serializeTable, deserializeTable } from './table'
import { serializeUnion, deserializeUnion } from './union'
import { serializeStruct, deserializeStruct } from './struct'
import { littleHexToInt } from './utils'
import { HEADER_ELEMENT_SIZE } from './utils/const'
import { normalizeStruct } from './struct/utils'

const SCHEMA_HAS_INVALID_TYPE = 'Schema has invalid type'
interface FieldBasis {
  name: string
}
interface StructBasis extends FieldBasis {
  byteLength: number
}
interface TableBasis extends FieldBasis {}

interface ByteSchema {
  type: 'byte'
}

interface ArraySchema {
  type: 'array'
  item: ArraySchema | StructSchema | ByteSchema
  itemCount: number
}

interface FixvecSchema {
  type: 'fixvec'
  item: ArraySchema | StructSchema | ByteSchema
}
interface DynvecSchema {
  type: 'dynvec'
  item: Schema
}
interface OptionSchema {
  type: 'option'
  item: Schema
}
interface UnionSchema {
  type: 'union'
  items: Schema[]
}
interface StructSchema {
  type: 'struct'
  fields: ((ArraySchema | StructSchema | ByteSchema) & StructBasis)[]
}
interface TableSchema {
  type: 'table'
  fields: (Schema & TableBasis)[]
}

type Schema =
  | ByteSchema
  | ArraySchema
  | FixvecSchema
  | DynvecSchema
  | OptionSchema
  | UnionSchema
  | StructSchema
  | TableSchema

export const isByteSchema = (schema: Pick<Schema, 'type'>): schema is ByteSchema => schema.type === 'byte'
export const isArraySchema = (schema: Pick<Schema, 'type'>): schema is ArraySchema => schema.type === 'array'
export const isFixvecSchema = (schema: Pick<Schema, 'type'>): schema is FixvecSchema => schema.type === 'fixvec'
export const isDynvecSchema = (schema: Pick<Schema, 'type'>): schema is DynvecSchema => schema.type === 'dynvec'
export const isOptionSchema = (schema: Pick<Schema, 'type'>): schema is OptionSchema => schema.type === 'option'
export const isUnionSchema = (schema: Pick<Schema, 'type'>): schema is UnionSchema => schema.type === 'union'
export const isStructSchema = (schema: Pick<Schema, 'type'>): schema is StructSchema => schema.type === 'struct'
export const isTableSchema = (schema: Pick<Schema, 'type'>): schema is TableSchema => schema.type === 'table'

class Molecule {
  private static types = ['byte', 'array', 'fixvec', 'dynvec', 'option', 'union', 'struct', 'table']

  private schema!: Schema

  constructor(schema: Schema) {
    this.setSchema(schema)
  }

  public static getBasicTypes = () => {
    return Molecule.types
  }

  public getSchema = () => {
    return this.schema
  }

  public setSchema = (schema: Schema = { type: 'byte' }) => {
    this.validateSchema(schema)
    this.schema = schema
  }

  public serialize = (obj: any) => {
    const copied: { [key: string]: string } | string[] = JSON.parse(JSON.stringify(obj))

    if (this.isBasicObject(copied)) {
      const result = this.serializeBasic(copied)
      return result
    }

    const normalized = this.normalize(copied)
    const result = this.serializeBasic(normalized)

    return result
  }

  public deserialize = (serialized: string) => {
    const deserialized = this.deserializeBasic(serialized)
    if (deserialized === '0x' || deserialized === '') return deserialized
    return this.deserializeChildren(deserialized)
  }

  private validateSchema = (schema: Schema) => {
    if (typeof schema !== 'object') {
      throw new Error('Schema is invalid')
    }
    if (Molecule.types.indexOf(schema.type) < 0) {
      throw new Error(SCHEMA_HAS_INVALID_TYPE)
    }
    if (schema.type === 'array') {
      if (!schema.itemCount || typeof schema.itemCount !== 'number' || Number.isNaN(schema.itemCount)) {
        throw new Error('ArraySchema must have valid itemCount')
      }
    }
  }

  private isBasicObject = (obj: { [index: string]: string } | string[] | string) => {
    switch (this.schema.type) {
      case 'byte':
        return typeof obj === 'string'
      case 'array':
        return Array.isArray(obj) && obj.every(item => typeof item === 'string') && obj.length === this.schema.itemCount
      case 'fixvec':
      case 'dynvec':
        return Array.isArray(obj) && obj.every(item => typeof item === 'string')
      case 'option':
        return typeof obj === 'string'
      case 'union':
        return Array.isArray(obj) && typeof obj[0] === 'number' && typeof obj[1] === 'string'
      case 'table':
      case 'struct':
        return Array.isArray(obj) && obj.every(([, val]) => typeof val === 'string')
      default:
        throw new Error(SCHEMA_HAS_INVALID_TYPE)
    }
  }

  private serializeBasic = (value: any) => {
    switch (this.schema.type) {
      case 'byte':
        return value
      case 'array':
        return serializeArray(value)
      case 'fixvec':
        return serializeFixvec(value)
      case 'dynvec':
        return serializeDynvec(value)
      case 'option':
        return serializeOption(value)
      case 'union':
        return serializeUnion(value)
      case 'struct':
        return serializeStruct(value)
      case 'table':
        return serializeTable(value)
      default:
        throw new Error(SCHEMA_HAS_INVALID_TYPE)
    }
  }

  private normalize = (copied: any) => {
    switch (this.schema.type) {
      case 'byte':
        return copied
      case 'array':
      case 'fixvec':
      case 'dynvec':
        return copied.map((item: any) => {
          const s = new Molecule((this.schema as ArraySchema | FixvecSchema | DynvecSchema).item)
          return s.serialize(item)
        })
      case 'option':
        return new Molecule(this.schema.item).serialize(copied)
      case 'union':
        return [[copied[0], new Molecule(this.schema.items[copied[0]]).serialize(copied[1])]]
      case 'struct':
        return copied.map((item: any, index: number) => {
          const s = new Molecule((this.schema as StructSchema).fields[index])
          return [item[0], s.serialize(item[1])]
        })
      case 'table':
        return copied.map((item: any, index: number) => {
          const s = new Molecule((this.schema as TableSchema).fields[index])
          return [item[0], s.serialize(item[1])]
        })
      default:
        throw new Error(SCHEMA_HAS_INVALID_TYPE)
    }
  }

  private deserializeBasic = (value: string) => {
    switch (this.schema.type) {
      case 'byte':
        return value
      case 'array':
        return deserializeArray(value, this.schema.itemCount)
      case 'fixvec':
        return deserializeFixvec(value)
      case 'dynvec':
        return deserializeDynvec(value)
      case 'option':
        return deserializeOption(value)
      case 'union':
        return deserializeUnion(value, [littleHexToInt(value.slice(0, HEADER_ELEMENT_SIZE * 2))])
      case 'struct':
        this.setSchema(normalizeStruct(this.schema))
        return deserializeStruct(
          value,
          this.schema.fields.map(field => [field.name, field.byteLength]),
        )
      case 'table':
        return deserializeTable(
          value,
          this.schema.fields.map(field => field.name),
        )
      default:
        throw new Error(SCHEMA_HAS_INVALID_TYPE)
    }
  }

  private deserializeChildren = (deserialized: any): any => {
    switch (this.schema.type) {
      case 'byte':
        return deserialized
      case 'array':
        return deserialized.map((value: string) => new Molecule((this.schema as ArraySchema).item).deserialize(value))
      case 'fixvec':
      case 'dynvec':
        return deserialized.map((value: string) => new Molecule((this.schema as DynvecSchema).item).deserialize(value))
      case 'union':
        return [
          [deserialized[0][0], new Molecule(this.schema.items[deserialized[0][0]]).deserialize(deserialized[0][1])],
        ]
      case 'option':
        return deserialized ? new Molecule(this.schema.item).deserialize(deserialized) : deserialized
      case 'struct':
        return this.schema.fields.map((field, idx) => {
          const res = new Molecule(field).deserialize(deserialized[idx][1])
          return [field.name, res]
        })
      case 'table':
        return this.schema.fields.map((field, idx) => {
          const res = new Molecule(field).deserialize(deserialized[idx][1])
          return [field.name, res]
        })
      default:
        throw new Error(SCHEMA_HAS_INVALID_TYPE)
    }
  }
}

export { Molecule }

export default Molecule
