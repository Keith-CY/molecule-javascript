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

class StrcutUtils {
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

  public computeByteLength = (field: StructField): number => {
    if (field.type === 'byte') {
      const byteLength = 1
      if (this.aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
        this.aliasLengthPair.push({ alias: field.alias, byteLength })
      }
      return byteLength
    }
    if (field.type === 'array') {
      const byteLength = (field as ArrayType).itemCount * this.computeByteLength((field as ArrayType).item)
      if (this.aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
        this.aliasLengthPair.push({ alias: field.alias, byteLength })
      }
      return byteLength
    }
    if (field.type === 'struct') {
      const byteLength = (field as StructType).fields
        .map((sub: StructField) => this.computeByteLength(sub))
        .reduce((previous, current) => previous + current)
      if (this.aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
        this.aliasLengthPair.push({ alias: field.alias, byteLength })
      }
      return byteLength
    }
    return 1
  }

  public assignByteLength = (field: StructField) => {
    let pairObject
    if (field.type === 'byte') {
      pairObject = this.aliasLengthPair.find(pair => pair.alias === field.alias) as {
        alias: string
        byteLength: number
      }
      field.byteLength = pairObject.byteLength
    } else if (field.type === 'array') {
      pairObject = this.aliasLengthPair.find(pair => pair.alias === field.alias) as {
        alias: string
        byteLength: number
      }
      field.byteLength = pairObject.byteLength
      this.assignByteLength((field as ArrayType).item)
    } else if (field.type === 'struct') {
      pairObject = this.aliasLengthPair.find(pair => pair.alias === field.alias) as {
        alias: string
        byteLength: number
      }
      field.byteLength = pairObject.byteLength
      ;(field as StructType).fields.forEach((sub: StructField) => {
        this.assignByteLength(sub)
      })
    }
  }

  public clearCache = () => {
    this.aliasLengthPair = []
  }
}

export const normalizeStruct = (schema: any) => {
  const struct: StructType = JSON.parse(JSON.stringify(schema))
  const strcutUtils = new StrcutUtils()
  strcutUtils.normalizeAlias(struct)
  strcutUtils.computeByteLength(struct)
  strcutUtils.assignByteLength(struct)
  strcutUtils.clearCache()
  return struct
}

export default { normalizeStruct }
