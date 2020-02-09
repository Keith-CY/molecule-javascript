#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs'

const [, , ...args] = process.argv

const schemaOrPath = args[0]
const outputFile = args[1] || ''

const handleSchema = () => {
  try {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile)
    }
    const normalizeScript = fs.existsSync(schemaOrPath)
      ? `const normalizedSchema = Schema.fromFile('${schemaOrPath}').getNormalizedSchema()`
      : `const normalizedSchema = new Schema(${schemaOrPath}).getNormalizedSchema()`
    const script = `const { Molecule } = require('molecule-javascript')
const { Schema }  = require('molecule-javascript/lib/schema')
${normalizeScript}
const molecules = {}
normalizedSchema.declarations.forEach(declaration => {
  molecules[declaration.name] = new Molecule(declaration)
})
module.exports = { normalizedSchema, molecules }
`
    if (outputFile) {
      fs.writeFileSync(outputFile, script)
      console.info(`Generator is generated at ${outputFile} successfully`)
    } else {
      console.info(script)
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (!schemaOrPath) {
  console.error('Please use command as molecule-javascript <schema | file path> [outputFile]')
  process.exit(1)
} else {
  handleSchema()
}

export default undefined
