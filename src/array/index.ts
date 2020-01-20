import { assertIsHexStr } from '../utils'

export const serializeArray = (array: HexString[]) => {
  array.forEach(item => {
    assertIsHexStr(item)
  })
  return `0x${array.map(item => item.slice(2)).join('')}`
}

export default { serializeArray }
