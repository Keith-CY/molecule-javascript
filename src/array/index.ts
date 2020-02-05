import { assertIsHexStr } from '../utils'

export const serializeArray = (array: HexString[]) => {
  if (!Array.isArray(array)) {
    throw new TypeError(`Expect ${array} to be an array`)
  }

  array.forEach(item => {
    assertIsHexStr(item)
  })

  return `0x${array.map(item => (item.length % 2 ? `0${item.slice(2)}` : item.slice(2))).join('')}`
}

export const deserializeArray = (serialized: HexString, itemCount: number) => {
  if (serialized === '0x' || itemCount === 0) {
    if (serialized === '0x' && itemCount === 0) {
      return []
    }
    throw new Error(`${serialized} cannot be deserialized by count ${itemCount}`)
  }

  assertIsHexStr(serialized)
  if (typeof itemCount !== 'number' || itemCount < 0) {
    throw new TypeError(`Expect item count to a non-negative number`)
  }

  const raw = serialized.length % 2 ? `0${serialized.slice(2)}` : serialized.slice(2)
  const itemLength = raw.length / itemCount
  if (itemLength % 2) {
    throw new Error(`${serialized} cannot be deserialized by count ${itemCount}`)
  }
  const matcher = new RegExp(`\\w{${itemLength}}`, 'g')
  const items = raw.match(matcher)
  return items!.map(item => `0x${item}`)
}

export default { serializeArray, deserializeArray }
