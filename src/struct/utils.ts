/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
type StructField = ByteType | ArrayType | StructType

interface ByteType {
  name: 'byte'
  type: 'byte'
  alias: string
  byteLength: number
}

interface ArrayType {
  name: string
  type: 'array'
  alias: string
  item: StructField
  itemCount: number
  byteLength: number
}

interface StructType {
  name: string
  type: 'struct'
  alias: string
  fields: StructField[]
  byteLength: number
}

class StructUtils {
  private aliasLengthPair: { alias: string; byteLength: number }[] = []

  private generateAlias = (field: StructField) => {
    if (field.type === 'struct') {
      const struct: StructType = field
      for (const sub of struct.fields) {
        sub.alias = `${sub.name ? sub.name : sub.type}-${field.alias}`
        if (sub.type !== 'byte') {
          this.generateAlias(sub)
        }
      }
    } else if (field.type === 'array') {
      const array: ArrayType = field
      array.item.alias = `${array.item.name ? array.item.name : array.item.type}-${array.alias}`
      if (array.item.type !== 'byte') {
        this.generateAlias(array.item)
      }
    }
  }

  public normalizeAlias = (field: StructField) => {
    field.alias = field.type === 'byte' ? field.type : field.name
    this.generateAlias(field)
  }

  private addPair = (field: StructField, byteLength: number) => {
    if (this.aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
      this.aliasLengthPair.push({ alias: field.alias, byteLength })
    }
  }

  public computeByteLength = (field: StructField): number => {
    let byteLength = 1
    switch (field.type) {
      case 'byte':
        byteLength = 1
        this.addPair(field, byteLength)
        return byteLength
      case 'array':
        byteLength = (field as ArrayType).itemCount * this.computeByteLength((field as ArrayType).item)
        this.addPair(field, byteLength)
        return byteLength
      case 'struct':
        byteLength = (field as StructType).fields
          .map((sub: StructField) => this.computeByteLength(sub))
          .reduce((previous, current) => previous + current)
        this.addPair(field, byteLength)
        return byteLength
      default:
        return byteLength
    }
  }

  private findPair = (field: StructField): { alias: string; byteLength: number } => {
    return this.aliasLengthPair.find(pair => pair.alias === field.alias) as {
      alias: string
      byteLength: number
    }
  }

  public assignByteLength = (field: StructField) => {
    switch (field.type) {
      case 'byte':
        field.byteLength = this.findPair(field).byteLength
        break
      case 'array':
        field.byteLength = this.findPair(field).byteLength
        this.assignByteLength((field as ArrayType).item)
        break
      case 'struct':
        field.byteLength = this.findPair(field).byteLength
        ;(field as StructType).fields.forEach((sub: StructField) => {
          this.assignByteLength(sub)
        })
        break
      default:
        break
    }
  }
}

export const normalizeStruct = (schema: any) => {
  const struct: StructType = JSON.parse(JSON.stringify(schema))
  const structUtils = new StructUtils()
  structUtils.normalizeAlias(struct)
  structUtils.computeByteLength(struct)
  structUtils.assignByteLength(struct)
  return struct
}

export default { normalizeStruct }
