import { assertIsHexStr, uint32Le, littleHexToInt } from '../utils'
import { HEADER_ELEMENT_SIZE } from '../utils/const'

export const serializeUnion = (origin: UnionElement[]) => {
  const values = origin.map(item => item[1])
  if (values.length !== 1) {
    throw Error('Expect the count of union element to be 1')
  }
  assertIsHexStr(values[0])
  const indices = origin.map(item => item[0])
  return uint32Le(`0x${indices[0].toString(16)}`) + values[0].slice(2)
}

export const deserializeUnion = (serialized: string, itemLength: number) => {
  assertIsHexStr(serialized)
  const indices = [littleHexToInt(serialized.slice(0, HEADER_ELEMENT_SIZE))]
  if (indices[0] >= itemLength) {
    throw Error('Expect union serialized index must be smaller than item length')
  }
  const value = `0x${serialized.slice(10)}`
  return [[indices[0], value]]
}

export default { serializeUnion, deserializeUnion }
