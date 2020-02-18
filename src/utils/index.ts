const padStart = (str: string, len: number, char: string) => {
  return (char.repeat(len) + str).slice(-1 * len)
}

export function assertIsHexStr(str: any): asserts str is HexString {
  if (typeof str !== 'string' || !str.startsWith('0x') || (Number.isNaN(+str) && str !== '0x')) {
    throw new TypeError(`Expect ${str} to be a hex string`)
  }
}

export const uint16Le = (uint16: string) => {
  assertIsHexStr(uint16)
  const buf = new ArrayBuffer(2)
  const dv = new DataView(buf)
  dv.setUint16(0, +uint16, true)
  return `0x${padStart(dv.getUint16(0, false).toString(16), 4, '0')}`
}

export const uint32Le = (uint32: string) => {
  assertIsHexStr(uint32)
  const buf = new ArrayBuffer(4)
  const dv = new DataView(buf)
  dv.setUint32(0, +uint32, true)
  return `0x${padStart(dv.getUint32(0, false).toString(16), 8, '0')}`
}

export const uint64Le = (uint64: string) => {
  assertIsHexStr(uint64)
  const val = padStart(uint64.slice(2), 16, '0')
  const valLeft = `0x${val.slice(0, 8)}`
  const valRight = `0x${val.slice(8)}`
  const viewLeft = uint32Le(valLeft).slice(2)
  const viewRight = uint32Le(valRight).slice(2)
  return `0x${viewRight}${viewLeft}`
}

export const fromUintLe = (uintLe: string) => {
  assertIsHexStr(uintLe)
  let raw = uintLe.slice(2)
  if (raw.length % 2) {
    raw = `0${raw}`
  }
  return `0x${raw
    .match(/\w{1,2}/g)!
    .reverse()
    .join('')}`
}

export const littleHexToInt = (littleHex: string) => {
  return parseInt(fromUintLe(littleHex), 16)
}

export default { uint16Le, uint32Le, uint64Le, fromUintLe, littleHexToInt }
