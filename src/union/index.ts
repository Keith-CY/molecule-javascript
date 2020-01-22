import { assertIsHexStr, uint32Le } from '../utils'

export const serializeUnion = (origin: UnionElement[]) => {
  const values = origin.map(item => item[1])
  if (values.length !== 1) {
    throw Error('Expect the count of union element to be 1')
  }
  assertIsHexStr(values[0])
  const indices = origin.map(item => item[0])
  return uint32Le(`0x${indices[0].toString(16)}`) + values[0].slice(2)
}

export const deserializeUnion = (serialized: string, indices: number[]) => {
  assertIsHexStr(serialized)
  if (indices.length !== 1) {
    throw Error('Expect the count of union element to be 1')
  }
  if (serialized.slice(0, 10) !== uint32Le(`0x${indices[0].toString(16)}`)) {
    throw Error('Expect serialized index to be equal to first indices element')
  }
  const value = `0x${serialized.slice(10)}`
  return [[indices[0], value]]
}

export default { serializeUnion, deserializeUnion }
