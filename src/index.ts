import { serializeArray, deserializeArray } from './array'
import { serializeFixvec, deserializeFixvec } from './fixvec'
import { serializeDynvec, deserializeDynvec } from './dynvec'
import { serializeOption, deserializeOption } from './option'
import { serializeUnion, deserializeUnion } from './union'
import { serializeTable } from './table'
import { serializeStruct } from './struct'
import { littleHexToInt } from './utils'
import { HEADER_ELEMENT_SIZE } from './utils/const'

const ByteItem = 'byte'

interface SchemaBasis {
  name: string
}

interface ArraySchema extends SchemaBasis {
  type: 'array'
  item: string
  itemCount: number
}

interface FixvecSchema extends SchemaBasis {
  type: 'fixvec'
  item: string
}
interface DynvecSchema extends SchemaBasis {
  type: 'dynvec'
  item: string
}
interface OptionSchema extends SchemaBasis {
  type: 'option'
  item: string
}
interface UnionSchema extends SchemaBasis {
  type: 'union'
  items: string[]
}
interface StructSchema extends SchemaBasis {
  type: 'struct'
  fields: Schema[]
}
interface TableSchema extends SchemaBasis {
  type: 'table'
  fields: Schema[]
}

type Schema = ArraySchema | FixvecSchema | DynvecSchema | OptionSchema | UnionSchema | StructSchema | TableSchema

class Molecule {
  private static types = ['array', 'fixvec', 'dynvec', 'option', 'union', 'struct', 'table']

  private schema: Schema | undefined

  constructor(schema: Schema) {
    this.setSchema(schema)
  }

  public static getBasicTypes = () => {
    return Molecule.types
  }

  public getSchema = () => {
    return this.schema
  }

  public setSchema = (schema: Schema) => {
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
    if (this.isBasicSerialized()) {
      return this.deserializeBasic(serialized)
    }
    const normalized = this.normalizeSerialized(serialized)
    const result = this.deserializeBasic(normalized)

    return result
  }

  private validateSchema = (schema: Schema) => {
    if (!schema) {
      throw new Error('Schema is required')
    }
    if (typeof schema !== 'object') {
      throw new Error('Schema is invalid')
    }
    if (!Molecule.types.includes(schema.type)) {
      throw new Error('Schema has invalid type')
    }
    if (schema.type === 'array') {
      if (!schema.itemCount || schema.itemCount === 0) {
        throw new Error('ArraySchema must have itemCount')
      }
    }
  }

  private isBasicObject = (obj: { [index: string]: string } | string[]) => {
    switch (this.schema!.type) {
      case 'array':
        return (
          Array.isArray(obj) &&
          obj.every(item => typeof item === 'string') &&
          obj.length === (this.schema as ArraySchema).itemCount
        )
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
        throw new Error('Invalid type')
    }
  }

  private serializeBasic = (value: any) => {
    switch (this.schema!.type) {
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
        return ''
    }
  }

  private normalize = (copied: any) => {
    switch (this.schema!.type) {
      case 'array':
      case 'fixvec':
      case 'dynvec':
        return copied.map((item: any) => {
          const s = new Molecule((this.schema as any).item)
          return s.serialize(item)
        })
      case 'option':
        return new Molecule((this.schema as any).item).serialize(copied)
      case 'union':
        return [[copied[0], new Molecule((this.schema as any).items[copied[0]]).serialize(copied[1])]]
      case 'struct':
        return copied.map((item: any, index: number) => {
          const s = new Molecule((this.schema as any).fields[index])
          return [item[0], s.serialize(item[1])]
        })
      case 'table':
        return copied.map((item: any, index: number) => {
          const s = new Molecule((this.schema as any).fields[index])
          return [item[0], s.serialize(item[1])]
        })
      default:
        return ''
    }
  }

  private deserializeBasic = (value: string) => {
    switch (this.schema!.type) {
      case 'array':
        return deserializeArray(value, (this.schema as ArraySchema)!.itemCount)
      case 'fixvec':
        return deserializeFixvec(value)
      case 'dynvec':
        return deserializeDynvec(value)
      case 'option':
        return deserializeOption(value)
      case 'union':
        return deserializeUnion(value, [littleHexToInt(value.slice(0, HEADER_ELEMENT_SIZE))])
      case 'struct':
      case 'table':
      default:
        return ''
    }
  }

  private isBasicSerialized = () => {
    switch (this.schema!.type) {
      case 'array':
      case 'fixvec':
      case 'dynvec':
      case 'option':
        return (this.schema as ArraySchema).item === ByteItem
      case 'union':
      case 'table':
      case 'struct':
        return false
      default:
        throw new Error('Invalid type')
    }
  }

  private normalizeSerialized = (copied: string) => {
    console.log(copied)
    switch (this.schema!.type) {
      case 'array':
      case 'fixvec':
      case 'dynvec':
      case 'option':
      case 'union':
      case 'struct':
      case 'table':
      default:
        return ''
    }
  }
}

export default Molecule
