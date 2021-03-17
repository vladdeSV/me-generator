import { generate } from '../source/generator'
import { generate as generateSvg } from '../source/svg-combiner'
import { Rulebook } from '../source/rulebook'
import { readFileSync, writeFileSync } from 'fs'
import seedrandom from 'seedrandom'
import path from 'path'

const pathToRulebook = '../me-generator-images/rulebook.json'
const seed = 'foobar'
const outputPath = './output.svg'

const rulebook = JSON.parse(readFileSync(pathToRulebook, { encoding: 'utf-8' })) as Rulebook
rulebook.path = path.join(path.dirname(pathToRulebook), rulebook.path === undefined ? '.' : rulebook.path)
const rng = seedrandom(seed)
const parts = generate(rng, rulebook)
const svg = generateSvg({
  width: 850,
  height: 270,
  parts: parts,
})

writeFileSync(outputPath, svg)
