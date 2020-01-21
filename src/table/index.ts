import { uint32Le, assertIsHexStr, littleHexToInt } from '../utils'
import { deserializeArray } from '../array'

const Uint32Length = 4

export const serializeTable = (origin: Array<TypeElement>): string => {
  const values = origin.map(item => item[1])
  values.forEach(item => {
    assertIsHexStr(item)
  })
  values.map(item => (item.length % 2 ? `0${item.slice(2)}` : item.slice(2)))

  const offsetsLength = (1 + values.length) * Uint32Length
  const valuesLength = values.map(value => value.slice(2).length / 2).reduce((total, value) => total + value)
  const length = offsetsLength + valuesLength
  let result = uint32Le(`0x${length.toString(16)}`)
  let offset = offsetsLength
  values.forEach(value => {
    result += uint32Le(`0x${offset.toString(16)}`).slice(2)
    offset += value.slice(2).length / 2
  })
  result += values.map(value => value.slice(2)).join('')
  return result
}

export const deserializeTable = (serialized: string, sizes: TypeSize[]) => {
  assertIsHexStr(serialized)
  const valuesLength = sizes.map(size => size[1]).reduce((total, value) => total + value)
  const offsetsLength = (1 + sizes.length) * Uint32Length
  const lengthHex = serialized.slice(0, 10)
  if (littleHexToInt(lengthHex) !== valuesLength + offsetsLength) {
    throw new TypeError(`Expect sum of size to be correct`)
  }
  const value = serialized.slice(2 + (1 + sizes.length) * 2 * Uint32Length)
  const deserialized = deserializeArray(
    `0x${value}`,
    sizes.map(size => size[1]),
  )
  return sizes.map((size, idx) => [size[0], deserialized[idx]])
}
