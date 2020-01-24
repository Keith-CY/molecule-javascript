import { uint32Le, littleHexToInt, assertIsHexStr } from '../utils'

export const serializeDynvec = (dynvec: HexString[]) => {
  if (!Array.isArray(dynvec)) {
    throw new TypeError(`Expect ${dynvec} to be an array`)
  }
  dynvec.forEach(item => {
    assertIsHexStr(item)
  })
  const HEADER_ELEMENT_SIZE = 4
  const HEADER_SIZE = HEADER_ELEMENT_SIZE * dynvec.length + HEADER_ELEMENT_SIZE

  const data = dynvec.map(item => (item.length % 2 ? `0${item.slice(2)}` : item.slice(2)))

  const body = data.join('')

  const offsets = data.length
    ? data.slice(1).reduce(
        (offsetList, _item, idx) => {
          const offset = offsetList[offsetList.length - 1] + data[idx].length / 2
          return [...offsetList, offset]
        },
        [HEADER_SIZE],
      )
    : []

  const header =
    uint32Le(`0x${(HEADER_SIZE + body.length / 2).toString(16)}`).slice(2) +
    offsets.map(offset => uint32Le(`0x${offset.toString(16)}`).slice(2)).join('')

  return `0x${header}${body}`
}

export const deserializeDynvec = (serialized: HexString) => {
  assertIsHexStr(serialized)
  const HEADER_ELEMENT_SIZE = 4
  const fullSize = littleHexToInt(serialized.slice(0, HEADER_ELEMENT_SIZE))

  if (fullSize * 2 !== serialized.slice(2).length) {
    throw new Error(`The full size of ${serialized} is incorrect`)
  }

  const items: HexString[] = []

  const offset0 = `0x${serialized.substr(2 + HEADER_ELEMENT_SIZE * 2, HEADER_ELEMENT_SIZE * 2)}`

  if (offset0 === '0x') {
    return items
  }
  const matcher = new RegExp(`\\w{${HEADER_ELEMENT_SIZE * 2}}`, 'g')
  const offsetsData = serialized.slice(2 + HEADER_ELEMENT_SIZE * 2, 2 + littleHexToInt(offset0) * 2)

  if (offsetsData.length % (2 * HEADER_ELEMENT_SIZE)) {
    throw new Error(`Expect offset 0x${offsetsData} to have a size of ${HEADER_ELEMENT_SIZE} bytes`)
  }

  const offsets: string[] = offsetsData.match(matcher)!.map(offset => `0x${offset}`)

  offsets.reduceRight((o1: number | string, o2: string) => {
    const end = typeof o1 === 'string' ? littleHexToInt(o1) : o1
    const start = littleHexToInt(o2)
    items.push(`0x${serialized.slice(2 + start * 2, 2 + end * 2)}`)
    return o2
  }, fullSize as any)
  return items.reverse()
}

export default { serializeDynvec, deserializeDynvec }
