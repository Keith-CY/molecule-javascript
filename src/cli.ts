#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs'

const info = (msg: string) => console.info(msg)
const warn = (msg: string) => console.warn(msg)
const [, , ...args] = process.argv

const schemaFilePath = args[0]
const outputFile = args[1]

const handleSchema = () => {
  try {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile)
    }
    const script = `const { Molecule, SchemaPrecessor } = require('molecule-javascript')
const normalizedSchema = SchemaPrecessor.fromFile('${schemaFilePath}').getNormalizedSchema()
const molecules = {}
normalizedSchema.declarations.forEach(declaration => {
  molecules[declaration.name] = new Molecule(declaration)
})
module.exports = { normalizedSchema, molecules }
`
    fs.writeFileSync(outputFile, script)
    info(`Generator is generated at ${outputFile} successfully`)
  } catch (err) {
    warn(err)
  }
}

if (!schemaFilePath || !outputFile) {
  warn('Please use command as molecule-javascript <schema file path> outputFile')
} else {
  handleSchema()
}

export default undefined
