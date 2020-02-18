#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs'
import readline from 'readline'

const { Schema } = require('../lib/schema.js')

const [, , ...args] = process.argv

let arg0 = args[0]
const arg1 = args[1] || ''

const printFormat = () => {
  console.info('JSON')
  process.exit(0)
}

const printNormalizedSchema = (filePath: string) => {
  const normalizedSchema = Schema.fromFile(filePath).getNormalizedSchema()
  console.info(JSON.stringify(normalizedSchema, null, 2))
  process.exit(0)
}

const outputGenerator = () => {
  const schameOrPath = arg0
  const outputFile = arg1
  try {
    if (!fs.existsSync(schameOrPath)) {
      try {
        JSON.parse(schemaOrPath)
      } catch {
        throw new Error(`Expect schema to be a JSON`)
      }
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
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile)
      }
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

const handleInput = () => {
  switch (arg0) {
    case '--format': {
      printFormat()
      break
    }
    case '-ns':
    case '--normalize-schema': {
      printNormalizedSchema(arg1)
      break
    }
    default: {
      outputGenerator()
    }
  }
}

if (!arg0) {
  let input = ''
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.on('line', line => {
    input += line
  })
    .on('close', () => {
      arg0 = input
      if (!arg0) {
        console.error('Please use command as moleculec-javascript <schema | file path> [arg1]')
        process.exit(1)
      }
      handleInput()
    })
    .on('error', err => {
      console.error(err)
      process.exit(1)
    })
} else {
  handleInput()
}

export default undefined
