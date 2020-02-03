import { uint32Le, littleHexToInt, assertIsHexStr } from '../utils/index'

export const serializeFixvec = (fixvec: HexString[]) => {
  if (!Array.isArray(fixvec)) {
    throw new TypeError(`Expect ${fixvec} to be an array`)
  }

  fixvec.forEach(item => {
    assertIsHexStr(item)
  })

  const data = fixvec.map(item => (item.length % 2 ? `0${item.slice(2)}` : item.slice(2)))

  const length = data[0]?.length ?? 0

  data.forEach(item => {
    if (item.length !== length) {
      throw new Error(`Expect items of an array to have the same size`)
    }
  })

  const header = uint32Le(`0x${data.length.toString(16)}`).slice(2)
  const body = data.join('')
  return `0x${header}${body}`
}

export const deserializeFixvec = (serialized: HexString) => {
  const HEADER_SIZE = 4
  const PREFIX_SIZE = 2 + HEADER_SIZE * 2
  assertIsHexStr(serialized)

  const count = littleHexToInt(serialized.slice(0, PREFIX_SIZE))
  const size = count ? (serialized.length - PREFIX_SIZE) / (count * 2) : 0

  if (size !== Math.floor(size)) {
    throw new Error(`${serialized.slice(PREFIX_SIZE)} cannot be divided into ${count} parts`)
  }

  const parts = []
  for (let i = 0; i < count; i++) {
    parts.push(`0x${serialized.substr(i * size * 2 + PREFIX_SIZE, size * 2)}`)
  }
  return parts
}

export default { serializeFixvec, deserializeFixvec }
