import { assertIsHexStr } from '../utils'

export const serializeStruct = (struct: TypeElement[]) => {
  const values = struct.map(item => item[1])
  values.forEach(val => assertIsHexStr(val))
  return `0x${values.map(item => (item.length % 2 ? `0${item.slice(2)}` : item.slice(2))).join('')}`
}

export const deserializeStruct = (serialized: HexString, sizes: TypeSize[]) => {
  assertIsHexStr(serialized)
  if (!Array.isArray(sizes) || !sizes.length) {
    throw new TypeError(`Expect sizes to be an array of size`)
  }

  sizes.forEach(size => {
    if (typeof size[1] !== 'number') {
      throw new TypeError('Expect size to be a number')
    }
  })

  const checkpoints: number[] = sizes.reduce(
    (points: number[], size: [string, number]) => {
      return [...points, points[points.length - 1] + size[1] * 2]
    },
    [0],
  )

  const raw = serialized.length % 2 ? `0${serialized.slice(2)}` : serialized.slice(2)

  if (checkpoints[checkpoints.length - 1] > raw.length) {
    throw new Error('Size exceeds the serialized data')
  }

  const deserialized = checkpoints.slice(1).map((point, idx) => {
    return `0x${raw.slice(checkpoints[idx], point)}`
  })
  return sizes.map((size, idx) => [size[0], deserialized[idx]])
}

export default { serializeStruct, deserializeStruct }
