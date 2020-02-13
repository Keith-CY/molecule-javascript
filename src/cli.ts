#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs'
import readline from 'readline'

const [, , ...args] = process.argv

let schemaOrPath = args[0]
const outputFile = args[1] || ''

const getFormat = () => {
  if (schemaOrPath === '--format') {
    console.info('JSON')
    process.exit(0)
  }
}

const handleInput = () => {
  getFormat()
  try {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile)
    }

    if (!fs.existsSync(schemaOrPath)) {
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
  let input = ''
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.on('line', line => {
    input += line
  })
    .on('close', () => {
      schemaOrPath = input
      if (!schemaOrPath) {
        console.error('Please use command as moleculec-javascript <schema | file path> [outputFile]')
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
