# Molecule-JavaScript

![npm](https://img.shields.io/npm/v/molecule-javascript) [![codecov](https://codecov.io/gh/Keith-CY/molecule-javascript/branch/master/graph/badge.svg)](https://codecov.io/gh/Keith-CY/molecule-javascript)

## Quick Start

There's a [template project](https://github.com/keith-cy/molecule-javascript-template) for quick start to use `molecule-javascript`.

It shows the most general way of using `molecule-javascript` in Browsers and Node.js with real-world demos.

## Start

### Use in Node.js

```js
import Molecule from 'molecule-javascript'

const normalizedSchema = {
  name: 'Bytes',
  type: 'fixvec',
  item: {
    type: 'byte',
  },
}
const data = ['0x01', '0x02']
const molecule = new Molecule(normalizedSchema)
const serialized = molecule.serialize(data) // expect to be "0x020000000102"
const parsed = molecule.deserialize('0x020000000102') // expect to be ["0x01", "0x02"]
```

### Use in Browsers

```js
const normalizedSchema = {
  name: 'Bytes',
  type: 'fixvec',
  item: {
    type: 'byte',
  },
}
const data = ['0x01', '0x02']
const molecule = new MoleculeJavaScript.Molecule(normalizedSchema) // The package is exposed as globalThis.MoleculeJavaScript
const serialized = molecule.serialize(data) // expect to be "0x020000000102"
const parsed = molecule.deserialize('0x020000000102') // expect to be ["0x01", "0x02"]
```

### Normalize Schema

Usually the schema will be defined with intermediate types in Molefile, e.g.

```
vector Word <byte>;
vector Words <Word>;
```

There're two steps to normalize it.

#### 1. Use [`Moleculec`](https://github.com/nervosnetwork/molecule/) to transform Molefile into JSON file, which is valid in JavaScript

This step requires `rust`

```bash
$ cargo install moleculec
$ moleculec --language - --format json --schema-file ./types.mol > ./types.json
```

By the opeartion above, a new file named `types.json` will be generated with following content:

```json
{
  "namespace": "types",
  "imports": [],
  "declarations": [
    {
      "type": "fixvec",
      "name": "Word",
      "item": "byte"
    },
    {
      "type": "dynvec",
      "name": "Words",
      "item": "Word"
    }
  ]
}
```

#### 2. Normalize intermediate types with native types

```sh
$ npx moleculec-js -ns ./types.json > normalized-types.json
```

Then the `normalized-types.json` is generated as follows

```json
{
  "namespace": "types",
  "declarations": [
    {
      "type": "fixvec",
      "name": "Word",
      "item": {
        "type": "byte"
      }
    },
    {
      "type": "dynvec",
      "name": "Words",
      "item": {
        "type": "fixvec",
        "item": {
          "type": "byte"
        }
      }
    }
  ]
}
```

### Shortcut for Node.js

The following three commands are equivalent.

```sh
moleculec-js ./schema.json molecules.js
# or
moleculec-js '{"namespace": "bytes", "declarations": [ { "name": "Bytes", "type": "fixvec","item": "byte" } ]}' molecules.js
# or used with moleculec
moleculec --language - --format json --schema-file ./schema.mol | moleculec-js > molecules.js
```

And `molecule.js` will be generated as

```js
const { Molecule } = require('molecule-javascript')
const { Schema } = require('molecule-javascript/lib/schema')
/**
 * moleculec-js ./schema.json molecules.js will use the file path directly
 * const normalizedSchema = new Schema('./schema.json').getNormalizedSchema()
 */
const normalizedSchema = new Schema({
  namespace: 'types',
  imports: [],
  declarations: [
    {
      type: 'fixvec',
      name: 'Bytes',
      item: 'byte',
    },
  ],
}).getNormalizedSchema()
const molecules = {}
normalizedSchema.declarations.forEach(declaration => {
  molecules[declaration.name] = new Molecule(declaration)
})
module.exports = { normalizedSchema, molecules }
```

## For Those Who Want More Info on Molecule

[Molecule](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0008-serialization/0008-serialization.md) is a canonicalization and zero-copy serialization format.

### Summary

#### Fixed Size or Dynamic Size

| Type | byte  | array | struct | vector  | table   | option  | union   |
| ---- | ----- | ----- | ------ | ------- | ------- | ------- | ------- |
| Size | Fixed | Fixed | Fixed  | Dynamic | Dynamic | Dynamic | Dynamic |

#### Memory Layout

```
|  Type  |                      Header                      |               Body                |
|--------+--------------------------------------------------+-----------------------------------|
| array  |                                                  |  item-0 |  item-1 | ... |  item-N |
| struct |                                                  | field-0 | field-1 | ... | field-N |
| fixvec | items-count                                      |  item-0 |  item-1 | ... |  item-N |
| dynvec | full-size | offset-0 | offset-1 | ... | offset-N |  item-0 |  item-1 | ... |  item-N |
| table  | full-size | offset-0 | offset-1 | ... | offset-N | filed-0 | field-1 | ... | field-N |
| option |                                                  | item or none (zero bytes)         |
| union  | item-type-id                                     | item                              |
```

### Primitive Type

- `byte`: the `byte` is a byte
  - Example: `00` is a `byte`

### Composite Types

- `array`: The `array` is a **fixed-size** type, it has <u>a fixed_size inner type and a fixed length</u>. The size of an `array` is the size of inner type times the length.

  ```
  |  Type  |  Header  |               Body                |             Size             |
  |--------+----------+-----------------------------------+------------------------------|
  | array  |          |  item-0 |  item-1 | ... |  item-N | size-of-innner-type * length |
  ```

  - To serialize an `array` only need to serialize all items in it. There's no overhead to serialize an `array`, which stores all items consecutively without extra spaces between two adjacent items.

  - Examples:
    - `array Byte3 [byte; 3]` stores `01 02 03` and is serialized as `01 02 03`
    - `array Uint32 [byte; 4]` stores a 32-bit unsigned interger `0x 01 02 03 04` in little-endian, and is serialized as `04 03 02 01`
    - `array TwoUint32 [Uint32; 2]` stores two 32-bit unsinged integers `0x 01 02 03 04`, `0x 0a bc de` in little-endian, and is serialized as `04 03 02 01 de bc 0a 00`

- `struct`: The `struct` is a **fixed-size** type, <u>all fields in `struct` are fixed-size and it has a fixed-size quantity of fields.</u>. The size of a `struct` is the sum of all fields' size.

  ```
  |  Type  |  Header  |               Body                |        Size         |
  |--------+----------+-----------------------------------+---------------------|
  | struct |          | field-0 | field-1 | ... | field-N | Sum of fields' size |
  ```

  - To serialize a `struct` only need to serialize all fields of it. Fields in a `struct` are stored in the order they are declared. There's no overhead to serialize a `struct`, which stores all fields consecutively without extra spaces between two adjacent items.

  - Examples:
    - `struct OnlyAByte { f1: byte }` stores a byte `ab` and is serialized as `ab`
    - `struct ByteAndUint32 { f1: byte, f2: Uint32 }` stores `{ f1: 'ab', f2: '0x010203' }`(uint32 into little-endian) and is serialized as `ab 03 02 01 00`

- `vector`: There are two kinds of vectors: `fixed-vector`, we call it `fixvec`, and `dynamic-vector`, we call it `dynvec`.

  Whether a vector is fiexed or dynamic depends on the type of its inner item: if the inner item is a fixed-size, then the vector is a `fixvec`; otherwise it's a `dynvec`

  But both of them are `dynamic-size`

  - `fixvec`: fixed vector

    ```
    |  Type  |   Header    |               Body                |                Size                |
    |--------+-------------+-----------------------------------|------------------------------------|
    | fixvec | items-count |  item-0 |  item-1 | ... |  item-N | 32 bits + inner-type-size * length |
    ```

    - There're two steps to serialize a `fixvec`:

      - Serialize the length as a uint32 in little-endian
      - Serialize the items

    - Examples:

      - `vector Bytes <byte>`

        - the serialized bytes of an empty bytes is `00 00 00 00 |`(the length of any empty fixed-vector is 0)
        - the serialized bytes of `0x12` is `01 00 00 00 | 12`
        - the serialzied bytes of `0x1234567890abcdef` is `08 00 00 00 | 12 34 56 78 90 ab cd ef`

      - `vector Uint32Vec <Uint32>`

        - the serialized bytes of empty `Uint32Vec` is `00 00 00 00 |`
        - the serialized bytes of `0x123`(or `[0x123]`) is `01 00 00 00 | 23 01 00 00`
        - the serialized bytes of `[0x123 0x456, 0x7890, 0xa, 0xbc, 0xdef]` is `06 00 00 00 | 23 01 00 00 | 56 04 00 00 | 90 78 00 00 | 0a 00 00 00 | bc 00 00 00 | ef 0d 00 00`

  - `dynvec`: dynamic vector

    ```
    |  Type  |   Header                                         |               Body                |                         Size                        |
    |--------+--------------------------------------------------+-----------------------------------|-----------------------------------------------------|
    | fixvec | full-size | offset-0 | offset-1 | ... | offset-N |  item-0 |  item-1 | ... |  item-N | 32 bits + 32 bits * item count + sum of items' size |
    ```

    - There're three steps to serialize a `dynvec`

      - Serialize the full size in bytes as a 32-bit unsigned interger in little-endian
      - Serialize all offsets of items as 32-bit unsigned integer in little-endian
      - Serialize all items

    - Examples:

      - `vector BytesVec <Bytes>`(Bytes is `fixvec <byte>`)

        - the serizlied bytes of an empty `BytesVec` is `04 00 00 00 |`
        - the serialied bytes of `[0x1234]` is `0e 00 00 00 | 08 00 00 00 | 02 00 00 00 12 34`, where full size is 14, offset is 8, item list is [020000001234].
        - the serialized bytes of `[0x1234, 0x, 0x567, 0x89, 0xabcdef]` is
          ```
          full size: 34 00 00 00 // 4 + 4 * 5 items + 28 items size
          offsets  :
                     18 00 00 00
                     1e 00 00 00
                     22 00 00 00
                     28 00 00 00
                     2d 00 00 00
          items    :
                     02 00 00 00 | 12 34
                     00 00 00 00 |
                     02 00 00 00 | 05 67
                     01 00 00 00 | 89
                     03 00 00 00 | ab cd ef
          ```

  - `table`: the `table` is a **dynamic-size** type, and can be considered as a `dynvec` but the length is fixed.

    ```
    |  Type  |                      Header                      |               Body                |                         Size                        |
    |--------+--------------------------------------------------+-----------------------------------|-----------------------------------------------------|
    | table  | full-size | offset-0 | offset-1 | ... | offset-N | filed-0 | field-1 | ... | field-N | 32 bits + 32 bits * item count + sum of items' size |
    ```

    - The steps of serialization of `table` are same as `dynvec`:

      - Serialize the full size in bytes as 32-bit unsigned integer in little-endian
      - Serialize all offsets of fields as 32-bit unsigned integer in little-endian
      - Serialize all fields of the table in the order as they are declared

    - Examples

      ```
      # table
      {
        f1: Bytes(0x),
        f2: byte(0xab),
        f3: uint32(0x123),
        f4: Byte3(0x456789),
        f5: Bytes(0xabcdef),
      }

      full size: 2b 00 00 00 // 4 + 4 * 5 items + (4 + 1 + 4 + 3 + 7)
      offsets  :
                 18 00 00 00
                 1c 00 00 00
                 1d 00 00 00
                 21 00 00 00
                 24 00 00 00
      items    :
                 00 00 00 00
                 ab
                 23 01 00 00
                 45 67 89
                 03 00 00 00 | ab cd ef
      ```

  - `option`: The `option` is a dynamic-size type.

    - To serialize an `option` depends on whether it is empty or not:

      - If it's empty, there'is **zero** bytes
      - If it's not empty, just serialize the inner item(the size is the same as it's inner item's)

    - Examples:
      - The serialized bytes of `Option` is ``(empty)
      - The serialized bytes of `Some([])` is `04 00 00 00`
      - The serialized bytes of `Some([0x])` is
        ```
        full size: 0c 00 00 00
        offsets  : 08 00 00 00
        items    : 00 00 00 00 |
        ```

  - `union`: The `union` is a dynamic-size type.

    - Serialization of a `union` type has two steps:

      - Serialize a item type id in bytes as a 32-bit unsigned integer in little-endian. The item type id is the index of the inner items, starting from 0.
      - Serialize the inner item.

    - Examples:
      Suppose the type of the union is

      ```
      {
        Bytes3,
        Bytes,
        BytesVec,
        BytesVecOpt,
      }
      ```

      - The serialized bytes of `Byte3(0x123456)` is `00 00 00 00 | 12 34 56`
      - The serialized bytes of `Bytes(0x)` is `01 00 00 00 | 00 00 00 00`
      - The serialized bytes of `Bytes(0x123)` is `01 00 00 00 | 02 00 00 00 | 01 23`
      - The serialized bytes of `BytesVec([])` is `02 00 00 00 | 04 00 00 00`
      - The serialized bytes of `BytesVec([0x])` is `02 00 00 00 | 0c 00 00 00 | 08 00 00 00 | 00 00 00 00`
      - The serialized bytes of `BytesVec([0x123])` is `02 00 00 00 | 0e 00 00 00 | 08 00 00 00 | 02 00 00 00 | 01 12`
      - The serialized bytes of `BytesVec([0x123, 0x456])` is `02 00 00 00 | 18 00 00 00 | 0c 00 00 00 | 12 00 00 00 | 02 00 00 00 | 01 23 | 02 00 00 00 | 04 56`

## Schema to JSON

`foo/types.mol`

```rust
// Schema
array Word [byte; 2]

struct Struct1 {
  f1: Word,
  f2: byte,
}
```

`bar/types.mol`

```rust
import ../foo/types;
vector Bytes <byte>
vector BytesVec <Bytes>
option ByteOpt (byte)

table Table1 {
  f1: Bytes,
  f2: byte,
  f3: ByteOpt,
}

union UnionA {
  Bytes,
  Struct1,
  byte,
  Table1,
}

```

intermediate for `bar/types.mol`

```json
// JSON
{
  "namespace": "types",
  "imports": [
    {
      "name": "types",
      "paths": ["foo"],
      "path_supers": 1
    }
  ],
  "declarations": [
    {
      "type": "fixvec",
      "name": "Bytes",
      "item": "byte"
    },
    {
      "type": "dynvec",
      "name": "BytesVec",
      "item": "Bytes"
    },
    {
      "type": "option",
      "name": "ByteOpt",
      "item": "byte"
    },
    {
      "type": "table",
      "name": "Table1",
      "fields": [
        {
          "name": "f1",
          "type": "Bytes"
        },
        {
          "name": "f2",
          "type": "byte"
        },
        {
          "name": "f3",
          "type": "ByteOpt"
        }
      ]
    },
    {
      "type": "union",
      "name": "UnionA",
      "items": ["Bytes", "Struct1", "byte", "Table1"]
    },
    {
      "type": "array",
      "name": "Word",
      "item": "byte",
      "item_count": 2,
      "imported_depth": 1
    },
    {
      "type": "struct",
      "name": "Struct1",
      "fields": [
        {
          "name": "f1",
          "type": "Word"
        },
        {
          "name": "f2",
          "type": "byte"
        }
      ],
      "imported_depth": 1
    }
  ]
}
```
