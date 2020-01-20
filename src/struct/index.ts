import { assertIsHexStr } from '../utils'
import { serializeArray } from '../array'

type StructElement = [string, string]

export const serializeStruct = (struct: StructElement[]) => {
  const values = struct.map(item => item[1])
  values.forEach(val => assertIsHexStr(val))
  return serializeArray(values)
}

export default { serializeStruct }
