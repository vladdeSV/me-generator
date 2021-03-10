import { Part } from '../svg-combiner'
import { generateV1 } from './v1'

import seedrandom from 'seedrandom'

export interface prng {
  (): number
  double(): number
  int32(): number
  quick(): number
  state(): seedrandom.State
}

export function generate(seed: string, version: string): Part[] {

  const rng = seedrandom(seed)

  switch (version) {
    default:
    case '1-alpha': return generateV1(rng)
  }
}
