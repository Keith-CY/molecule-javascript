import { assertIsHexStr } from '../utils'

export const serializeOption = (origin: string) => {
  if (origin) {
    assertIsHexStr(origin)
  }
  return origin || ''
}

export const deserializeOption = (serialized: string) => {
  if (serialized) {
    assertIsHexStr(serialized)
  }
  return serialized || ''
}

export default { serializeOption, deserializeOption }
