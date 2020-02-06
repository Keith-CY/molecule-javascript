#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs'

const info = (msg: string) => console.info(msg)
const warn = (msg: string) => console.warn(msg)
const [, , ...args] = process.argv

const schemaOrPath = args[0]
const outputFile = args[1]

const handleSchemaStr = (schemaStr: string) => {
  try {
    JSON.parse(schemaStr)
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile)
    }
    const script = `const Molecule = require('molecule-javascript').default
const schema = ${schemaStr}
const molecule = new Molecule(schema)
module.exports = { schema, molecule }
`
    fs.writeFileSync(outputFile, script)
    info(`Generator is generated at ${outputFile} successfully`)
  } catch (err) {
    warn(err)
  }
}

if (!schemaOrPath || !outputFile) {
  warn('Please use command as molecule-javascript <schema | schema path> outputFile')
} else if (fs.existsSync(schemaOrPath)) {
  const schemaPath = schemaOrPath
  const file = fs.readFileSync(schemaPath, 'utf-8')
  handleSchemaStr(file)
} else {
  handleSchemaStr(schemaOrPath)
}

export default undefined
