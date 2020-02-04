import { uint32Le, assertIsHexStr, littleHexToInt } from '../utils'
import { deserializeDynvec } from '../dynvec'
import { HEADER_ELEMENT_SIZE } from '../utils/const'

export const serializeTable = (origin: Array<TypeElement>): string => {
  let values = origin.map(item => item[1])
  values.forEach(item => {
    assertIsHexStr(item)
  })
  values = values.map(item => (item.length % 2 !== 0 ? `0${item.slice(2)}` : item.slice(2)))

  const offsetsLength = (1 + values.length) * HEADER_ELEMENT_SIZE
  const valuesLength = values.map(value => value.length / 2).reduce((total, value) => total + value)
  const length = offsetsLength + valuesLength
  let result = uint32Le(`0x${length.toString(16)}`)
  let offset = offsetsLength
  values.forEach(value => {
    result += uint32Le(`0x${offset.toString(16)}`).slice(2)
    offset += value.length / 2
  })
  result += values.join('')
  return result
}

export const deserializeTable = (serialized: string, sizes: TypeSize[]) => {
  assertIsHexStr(serialized)
  const valuesLength = sizes.map(size => size[1]).reduce((total, value) => total + value)
  const offsetsLength = (1 + sizes.length) * HEADER_ELEMENT_SIZE
  const lengthHex = serialized.slice(0, 10)
  if (littleHexToInt(lengthHex) !== valuesLength + offsetsLength) {
    throw new Error(`Expect sum of size to be correct`)
  }
  const deserialized = deserializeDynvec(serialized)
  return sizes.map((size, idx) => [size[0], deserialized[idx]])
}

export default { serializeTable, deserializeTable }
