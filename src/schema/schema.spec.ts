import path from 'path'
import Schema from '.'
import normalizedSchema from './normalized.schema.json'

describe('test schema', () => {
  test('test', () => {
    const filePath = path.resolve(__dirname, './root/root.schema.json')
    const schema = Schema.fromFile(filePath)
    const normalized = schema.getNormalizedSchema()
    expect(normalized).toEqual(normalizedSchema)
  })
})
