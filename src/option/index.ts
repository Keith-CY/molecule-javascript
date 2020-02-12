import { assertIsHexStr } from '../utils'

export const serializeOption = (origin: string) => {
  if (origin) {
    assertIsHexStr(origin)
  }
  return origin || '0x'
}

export const deserializeOption = (serialized: string) => {
  if (serialized) {
    assertIsHexStr(serialized)
  }
  return serialized || '0x'
}

export default { serializeOption, deserializeOption }
