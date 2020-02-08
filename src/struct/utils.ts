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

const generateAlias = (field: StructField) => {
  if (field.type === 'struct') {
    const struct: StructType = field
    for (const sub of struct.fields) {
      sub.alias = `${sub.name ? sub.name : sub.type}-${field.alias}`
      if (sub.type !== 'byte') {
        generateAlias(sub)
      }
    }
  } else if (field.type === 'array') {
    const array: ArrayType = field
    array.item.alias = `${array.item.name ? array.item.name : array.item.type}-${array.alias}`
    if (array.item.type !== 'byte') {
      generateAlias(array.item)
    }
  }
}

const normalizeAlias = (field: StructField) => {
  field.alias = field.type === 'byte' ? field.type : field.name
  generateAlias(field)
}

const aliasLengthPair: { alias: string; byteLength: number }[] = []
const computeByteLength = (field: StructField): number => {
  if (field.type === 'byte') {
    const byteLength = 1
    if (aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
      aliasLengthPair.push({ alias: field.alias, byteLength })
    }
    return byteLength
  }
  if (field.type === 'array') {
    const byteLength = (field as ArrayType).itemCount * computeByteLength((field as ArrayType).item)
    if (aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
      aliasLengthPair.push({ alias: field.alias, byteLength })
    }
    return byteLength
  }
  if (field.type === 'struct') {
    const byteLength = (field as StructType).fields
      .map((sub: StructField) => computeByteLength(sub))
      .reduce((previous, current) => previous + current)
    if (aliasLengthPair.findIndex(pair => pair.alias === field.alias) < 0) {
      aliasLengthPair.push({ alias: field.alias, byteLength })
    }
    return byteLength
  }
  return 1
}

const assignByteLength = (field: StructField) => {
  let pairObject
  if (field.type === 'byte') {
    pairObject = aliasLengthPair.find(pair => pair.alias === field.alias) as { alias: string; byteLength: number }
    field.byteLength = pairObject.byteLength
  } else if (field.type === 'array') {
    pairObject = aliasLengthPair.find(pair => pair.alias === field.alias) as { alias: string; byteLength: number }
    field.byteLength = pairObject.byteLength
    assignByteLength((field as ArrayType).item)
  } else if (field.type === 'struct') {
    pairObject = aliasLengthPair.find(pair => pair.alias === field.alias) as { alias: string; byteLength: number }
    field.byteLength = pairObject.byteLength
    ;(field as StructType).fields.forEach((sub: StructField) => {
      assignByteLength(sub)
    })
  }
}

export const normalizeStruct = (schema: any) => {
  const struct: StructType = JSON.parse(JSON.stringify(schema))
  normalizeAlias(struct)
  computeByteLength(struct)
  assignByteLength(struct)
  return struct
}

export default { normalizeStruct }
