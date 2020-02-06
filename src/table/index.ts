import { uint32Le, assertIsHexStr } from '../utils'
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

export const deserializeTable = (serialized: string, keys: string[]) => {
  assertIsHexStr(serialized)
  const deserialized = deserializeDynvec(serialized)
  return keys.map((key, idx) => [key, deserialized[idx]])
}

export default { serializeTable, deserializeTable }
