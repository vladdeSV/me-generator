import { DocumentConfiguration, generate as generateSvg, Part } from '../svg-combiner'
import { generateV1 } from './v1'
import fs from 'fs'

import seedrandom from 'seedrandom'

export interface prng {
  (): number
  double(): number
  int32(): number
  quick(): number
  state(): seedrandom.State
}

function generate(seed: string, version: '1-alpha'): Part[] {

  const rng = seedrandom(seed)

  switch (version) {
    default:
    case '1-alpha': return generateV1(rng)
  }
}

(() => {

  const seed = process.argv[2] ?? Math.random().toString(36).substring(2)

  const config: DocumentConfiguration = {
    width: 850,
    height: 270,
    parts: generate(seed, '1-alpha'),
  }

  const data = generateSvg(config)
  fs.writeFileSync('output.svg', data)
  console.log('generated svg')

})()
