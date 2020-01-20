import { assertIsHexStr } from '../utils'
import { serializeArray, deserializeArray } from '../array'

type StructElement = [string, string]
type StructSize = [string, number]

export const serializeStruct = (struct: StructElement[]) => {
  const values = struct.map(item => item[1])
  values.forEach(val => assertIsHexStr(val))
  return serializeArray(values)
}

export const deserializeStruct = (serialized: string, sizes: StructSize[]) => {
  const deserialized = deserializeArray(
    serialized,
    sizes.map(structSize => structSize[1]),
  )
  return sizes.map((size, idx) => [size[0], deserialized[idx]])
}

export default { serializeStruct, deserializeStruct }
