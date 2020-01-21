import Type from '../base'
import { serializeArray } from '../array'
import { serializeStruct } from '../struct'
import { uint32Le } from '../utils'

const Uint32Length = 4

export default abstract class Table extends Type {
  static serialize(origin: Array<TableElement>): string {
    let values = origin.map(item => item[1])
    values = values.map(val => {
      if (Array.isArray(val) && val.length) {
        if (typeof val[0] === 'string') {
          return serializeArray(val as HexString[])
        }
        return serializeStruct(val as StructElement[])
      }
      return val
    })
    const lengthOffset = (1 + values.length) * Uint32Length
    const valuesLength: number = values.map(value => value.slice(2).length / 2).reduce((total, value) => total + value)
    let result = uint32Le(`0x${(valuesLength + lengthOffset).toString(16)}`)
    let offset = lengthOffset
    values.forEach(value => {
      result += uint32Le(`0x${offset.toString(16)}`).slice(2)
      offset += value.slice(2).length / 2
    })
    values.forEach(value => {
      result += value.slice(2)
    })
    return result
  }

  static deserialize(serialized: any): any {
    return serialized
  }
}
