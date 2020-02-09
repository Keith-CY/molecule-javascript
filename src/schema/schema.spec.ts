import path from 'path'
import { Schema } from '.'
import normalizedSchema from './normalized.schema.json'

describe('schema', () => {
  test('normalize', () => {
    const filePath = path.resolve(__dirname, './root/root.schema.json')
    const schema = Schema.fromFile(filePath)
    const normalized = schema.getNormalizedSchema()
    expect(normalized).toEqual(normalizedSchema)
  })

  test('schema not exists should throw an error', () => {
    const filePath = path.resolve(__dirname, './root.schema.json')
    expect(() => {
      Schema.fromFile(filePath)
    }).toThrow()
  })

  test('re-declare type should throw an error', () => {
    const filePath = path.resolve(__dirname, './root/redeclared.schema.json')
    expect(() => Schema.fromFile(filePath)).toThrow('Type Word has been declared')
  })

  test('undeclare type should throw an error', () => {
    const filePath = path.resolve(__dirname, './root/undeclared.schema.json')
    expect(() => Schema.fromFile(filePath)).toThrow('Type Word is not declared')
  })

  test('item_count should be a number', () => {
    const schema = {
      namespace: 'Word',
      declarations: [
        {
          name: 'Word',
          type: 'array',
          item_count: '1',
        },
      ],
    }
    expect(() => {
      /* eslint-disable no-new */
      new Schema(schema)
    }).toThrow('Expect item_count to be a number')
  })
})
