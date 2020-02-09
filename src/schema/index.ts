import fs from 'fs'
import path from 'path'
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
declare namespace RawData {
  interface DeclarationBasis {
    name: string
  }
  interface ArrayDeclaration extends DeclarationBasis {
    type: 'array'
    item_count: number
  }
  interface StructDeclaration extends DeclarationBasis {
    type: 'struct'
    fields: any[]
  }
  interface RawJson {
    namespace: string
    imports?: any[]
    declarations: any[]
  }
}
/* eslint-enable no-unused-vars */
class Schema {
  public readonly namespace: string

  private rawJson: RawData.RawJson

  private normalizedJson: any = {}

  public filePath: string

  public declarations = new Map<string, any>([])

  public static fromFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} doesn't exist`)
    }
    const jsonStr = fs.readFileSync(filePath, 'utf-8')
    try {
      const json = JSON.parse(jsonStr)
      const schema = new Schema(json, undefined, filePath)
      return schema
    } catch (err) {
      console.warn(err)
      throw err
    }
  }

  constructor(
    rawJson: RawData.RawJson,
    declarations = new Map<string, any>([]),
    filePath = `${process.cwd()}/root-schema.json`,
  ) {
    this.rawJson = rawJson
    this.declarations = declarations
    this.namespace = this.rawJson.namespace
    this.filePath = filePath
    this.mergeImports()
    this.normalize()
  }

  private mergeImports = () => {
    if (Array.isArray(this.rawJson.imports)) {
      this.rawJson.imports.forEach((meta: { name: string; paths: string[]; path_supers: number }) => {
        const filePath = path.resolve(
          path.dirname(this.filePath),
          '../'.repeat(meta.path_supers || 0),
          ...meta.paths,
          `${meta.name}.json`,
        )
        const schema = Schema.fromFile(filePath)
        schema.getNormalizedSchema().declarations.forEach((declaration: any) => {
          if (this.declarations.get(declaration.name)) {
            throw new Error(`Type ${declaration.name} has been declared and cannot be imported`)
          }
          this.declarations.set(declaration.name, declaration)
        })
      })
    }
  }

  public getNormalizedSchema = () => {
    return {
      namespace: this.namespace,
      declarations: this.normalizedJson,
    }
  }

  private normalize = () => {
    const normalizedJson = this.rawJson.declarations.map(rawDeclaration => {
      if (this.declarations.get(rawDeclaration.name)) {
        throw new Error(`Type ${rawDeclaration.name} has been declared`)
      }
      const declaration = JSON.parse(JSON.stringify(rawDeclaration))
      if (declaration.item) {
        declaration.item = typeof declaration.item === 'string' ? { type: declaration.item } : declaration.item
      }
      if (Array.isArray(declaration.items)) {
        declaration.items = declaration.items.map((item: any) => (typeof item === 'string' ? { type: item } : item))
      }
      if (Array.isArray(declaration.fields)) {
        declaration.fields = declaration.fields.map((field: any) =>
          typeof field === 'string' ? { type: field } : field,
        )
      }
      try {
        switch (declaration.type) {
          case 'byte':
            return declaration
          case 'array': {
            if (typeof declaration.item_count !== 'number') {
              throw new Error('Expect item_count to be a number')
            }
            const { item_count: itemCount, item, ...rest } = declaration
            const normalizedType = {
              ...rest,
              itemCount,
            }
            if (item) {
              const tmp = new Schema(
                {
                  namespace: declaration.name,
                  declarations: [item],
                },
                this.declarations,
              ).getNormalizedSchema().declarations[0]
              normalizedType.item = tmp
            }
            this.declarations.set(normalizedType.name, normalizedType)
            return normalizedType
          }
          case 'option':
          case 'fixvec':
          case 'dynvec': {
            const normalizedType = {
              ...declaration,
              item: new Schema(
                { namespace: declaration.name, declarations: [declaration.item] },
                this.declarations,
              ).getNormalizedSchema().declarations[0],
            }
            this.declarations.set(normalizedType.name, normalizedType)
            return normalizedType
          }
          case 'union': {
            if (!declaration.items) {
              return declaration
            }
            const normalizedType = {
              ...declaration,
              items: declaration.items.map((item: any) => {
                const res = new Schema(
                  {
                    namespace: declaration.name,
                    declarations: [item],
                  },
                  this.declarations,
                ).getNormalizedSchema()
                return res.declarations[0]
              }),
            }
            this.declarations.set(normalizedType.name, normalizedType)
            return normalizedType
          }
          case 'struct':
          case 'table': {
            if (!declaration.fields) {
              return declaration
            }
            const normalizedType = {
              ...declaration,
              fields: declaration.fields.map((field: any) => {
                const res = new Schema(
                  {
                    namespace: declaration.name,
                    declarations: [field],
                  },
                  this.declarations,
                ).getNormalizedSchema()
                return res.declarations[0]
              }),
            }
            this.declarations.set(normalizedType.name, normalizedType)
            return normalizedType
          }
          default: {
            const type = this.declarations.get(declaration.type)
            if (type) {
              return type
            }
            throw new Error(`Type ${declaration.type} is not declared`)
          }
        }
      } catch (err) {
        console.error(err)
        throw new Error(`[${declaration.name}: ${declaration.type}]: ${err}`)
      }
    })
    this.normalizedJson = normalizedJson
  }
}

export { Schema }

export default Schema
