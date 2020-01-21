declare type Byte = string
declare type HexString = string
declare type TypeElement = [string, string]
declare type TypeSize = [string, number]

declare module '*.json' {
  const value: string
  export default value
}
