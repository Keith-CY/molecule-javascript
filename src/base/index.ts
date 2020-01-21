interface TypeInterface {
  serialize(type: any): string
  deserialize(serialized: any): any
}

export default abstract class Type implements TypeInterface {
  abstract serialize(type: any): string

  abstract deserialize(serialized: any): any
}
