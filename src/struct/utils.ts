/* eslint-disable no-param-reassign */
type StructField = ByteType | ArrayType | StructType

interface ByteType {
  name: 'byte'
  type: 'byte'
  byteLength: number
}

interface ArrayType {
  name: string
  type: 'array'
  item: StructField
  itemCount: number
  byteLength: number
}

interface StructType {
  name: string
  type: 'struct'
  fields: StructField[]
  byteLength: number
}

const nameLengthPair: { name: string; byteLength: number }[] = []
const computeByteLength = (field: StructField): number => {
  if (field.type === 'byte') {
    const byteLength = 1
    if (nameLengthPair.findIndex(pair => pair.name === field.type) < 0) {
      nameLengthPair.push({ name: field.type, byteLength })
    }
    return byteLength
  }
  if (field.type === 'array') {
    const byteLength = (field as ArrayType).itemCount * computeByteLength((field as ArrayType).item)
    if (nameLengthPair.findIndex(pair => pair.name === field.name) < 0) {
      nameLengthPair.push({ name: field.name, byteLength })
    }
    return byteLength
  }
  if (field.type === 'struct') {
    const byteLength = (field as StructType).fields
      .map((sub: StructField) => computeByteLength(sub))
      .reduce((previous, current) => previous + current)
    if (nameLengthPair.findIndex(pair => pair.name === field.name) < 0) {
      nameLengthPair.push({ name: field.name, byteLength })
    }
    return byteLength
  }
  return 1
}

const assignByteLength = (field: StructField) => {
  let pairObject
  if (field.type === 'byte') {
    pairObject = nameLengthPair.find(pair => pair.name === field.type) as { name: string; byteLength: number }
    field.byteLength = pairObject.byteLength
  } else if (field.type === 'array') {
    pairObject = nameLengthPair.find(pair => pair.name === field.name) as { name: string; byteLength: number }
    field.byteLength = pairObject.byteLength
    assignByteLength((field as ArrayType).item)
  } else if (field.type === 'struct') {
    pairObject = nameLengthPair.find(pair => pair.name === field.name) as { name: string; byteLength: number }
    field.byteLength = pairObject.byteLength
    ;(field as StructType).fields.forEach((sub: StructField) => {
      assignByteLength(sub)
    })
  }
}

export const normalizeStruct = (schema: any) => {
  const struct: StructType = JSON.parse(JSON.stringify(schema))
  computeByteLength(struct)
  assignByteLength(struct)
  return struct
}

export default { normalizeStruct }
