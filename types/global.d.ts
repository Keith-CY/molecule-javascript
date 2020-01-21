declare type Byte = string
declare type HexString = string
declare type StructElement = [string, string]
declare type TableElement = [string, any]

declare module '*.json' {
  const value: string
  export default value
}
