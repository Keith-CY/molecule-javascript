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

export const deserializeArray = (serialized: HexString, sizes: number[]) => {
  assertIsHexStr(serialized)
  if (!Array.isArray(sizes) || !sizes.length) {
    throw new TypeError(`Expect sizes to be an array of size`)
  }
  sizes.forEach(size => {
    if (typeof size !== 'number') {
      throw new TypeError('Expect size to be a number')
    }
  })
  const checkpoints: number[] = sizes.reduce(
    (points: number[], size: number) => {
      return [...points, points[points.length - 1] + size * 2]
    },
    [0],
  )

  const raw = serialized.length % 2 ? `0${serialized.slice(2)}` : serialized.slice(2)

  if (checkpoints[checkpoints.length - 1] > raw.length) {
    throw new Error('Size exceeds the serialized data')
  }

  return checkpoints.slice(1).map((point, idx) => {
    return `0x${raw.slice(checkpoints[idx], point)}`
  })
}

export default { serializeArray, deserializeArray }
