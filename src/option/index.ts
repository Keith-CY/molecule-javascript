import { assertIsHexStr } from '../utils'
import { deserializeArray } from '../array'

export const serializeOption = (origin: TypeElement[]) => {
  const values = origin.map(item => item[1])
  if (values.length !== 1) {
    throw Error('Expect the count of option element to be 1')
  }
  if (values[0]) {
    assertIsHexStr(values[0])
  }
  return values[0] ? values[0] : ''
}

export const deserializeOption = (serialized: string, sizes: TypeSize[]) => {
  if (sizes.length !== 1) {
    throw Error('Expect the count of option element to be 1')
  }
  if (!serialized || sizes[0][1] === 0) {
    return [[sizes[0][0], '']]
  }
  if (serialized) {
    assertIsHexStr(serialized)
  }
  const deserialized = deserializeArray(
    serialized,
    sizes.map(size => size[1]),
  )
  return sizes.map((size, idx) => [size[0], deserialized[idx]])
}

export default { serializeOption, deserializeOption }
