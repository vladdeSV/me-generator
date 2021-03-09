import { prng } from './index'
import { Part } from '../svg-combiner'

export function generateV1(rng: prng): Part[] {
  const ids = [
    'torso',
    'right leg',
    'left leg',
    'left arm',
    'right arm',
    'head',
    'underwear 1',

    'duality socks',
    randomWeightPart(rng, ['beige cargo pants', { partId: undefined, weight: 0.1 }]),
    //'necklace',
    'ltt crewneck',
    ...generateFacialHairIds(rng),
    randomWeightPart(rng, ['minibrills', { partId: undefined, weight: 10 }]),

    'right hand',
    'left hand',
  ]
  return convertPartIdsToParts(ids, parts)
}

function generateFacialHairIds(rng: prng): (string | undefined)[] {
  const hair = randomWeightPart(rng, [
    'hair roff',
    'hair 1cm',
    'ltt touke',
  ])

  let beardPool: (string | WeightedPart)[] = [{ partId: 'beard bigger', weight: 3 }, 'beard 3mm', { partId: undefined, weight: 0.5 }]
  if (hair === 'hair roff') {
    beardPool = beardPool.filter((item: string | WeightedPart) => {
      if (typeof item === 'string') {
        return item !== 'beard 3mm'
      }

      return item.partId !== 'beard 3mm'
    })
  }

  const beard = randomWeightPart(rng, beardPool)
  if (hair === 'hair roff' && beard === 'hair 3mm') {
    throw new Error('cannot have roff hair with 3mm beard')

  }

  return [hair, beard]
}

type PartMap = {
  [name: string]: Part
}

type PartId = string
type WeightedPart = { partId: PartId | undefined, weight?: number }

function selectRandomElementByWeight<T>(rng: prng, input: T[], weights: number[]): T {

  if (input.length !== weights.length) {
    throw new Error('input and weight lengths must match')
  }

  const aggregatedWeights = weights.map((sum => (value: number) => sum += value)(0))
  const weightTotal = Math.trunc(rng() * weights.reduce((sum: number, weight) => sum + weight, 0))
  const index = aggregatedWeights.filter(el => weightTotal >= el).length

  return input[index]
}

function randomWeightPart(rng: prng, parts: (WeightedPart | PartId | undefined)[]): PartId | undefined {

  function defined<T>(value: T | undefined): value is T {
    return value !== undefined
  }

  const weightedParts = parts
    .filter(defined)
    .map(part => typeof part === 'string' ? { partId: part } : part)
    .map(part => {
      return { partId: part.partId, weight: part.weight ?? 1 }
    })

  const partIds = weightedParts.map(part => part.partId)
  const partWeights = weightedParts.map(part => part.weight)
  return selectRandomElementByWeight(rng, partIds, partWeights)
}

const parts: PartMap = {
  'torso': {
    file: './me-generator-images/torso.svg',
    x: 399.4,
    y: 94.8,
  },
  'right leg': {
    file: './me-generator-images/right leg.svg',
    x: 336.1,
    y: 26.5,
  },
  'left leg': {
    file: './me-generator-images/left leg.svg',
    x: 47.7,
    y: 175.4,
  },
  'left arm': {
    file: './me-generator-images/left arm.svg',
    x: 683.9,
    y: 137.3,
  },
  'right arm': {
    file: './me-generator-images/right arm.svg',
    x: 490.9,
    y: 80.9,
  },
  'head': {
    file: './me-generator-images/head.svg',
    x: 654.3,
    y: 51.7,
  },
  'underwear 1': {
    file: './me-generator-images/underwear 1.svg',
    x: 403.9,
    y: 124.9,
  },
  'duality socks': {
    file: './me-generator-images/duality socks.svg',
    x: 46.7,
    y: 146.3,
  },
  'beige cargo pants': {
    file: './me-generator-images/beige cargo pants.svg',
    x: 147.5,
    y: 21.8,
  },
  'necklace': {
    file: './me-generator-images/necklace.svg',
    x: 641.4,
    y: 113.6,
  },
  'ltt crewneck': {
    file: './me-generator-images/ltt crewneck.svg',
    x: 471.8,
    y: 79.1,
  },
  'beard bigger': {
    file: './me-generator-images/beard bigger.svg',
    x: 649.5,
    y: 86.3,
  },
  'beard 3mm': {
    file: './me-generator-images/beard 3mm.svg',
    x: 649.5,
    y: 86.3,
  },
  'hair roff': {
    file: './me-generator-images/hair roff.svg',
    x: 671.5,
    y: 36.3,
  },
  'hair 1cm': {
    file: './me-generator-images/hair 1cm.svg',
    x: 675.3,
    y: 51.7,
  },
  'ltt touke': {
    file: './me-generator-images/ltt touke.svg',
    x: 664.1,
    y: 29.7,
  },
  'minibrills': {
    file: './me-generator-images/minibrills.svg',
    x: 671.1,
    y: 77,
  },
  'left hand': {
    file: './me-generator-images/left hand.svg',
    x: 695.2,
    y: 84,
  },
  'right hand': {
    file: './me-generator-images/right hand.svg',
    x: 539.4,
    y: 205.8,
  },
}

function convertPartIdsToParts(ids: (string | undefined)[], parts: PartMap): Part[] {
  const ret: Part[] = []

  for (const id of ids) {
    if (id === undefined) {
      continue
    }

    const part = parts[id]

    if (part === undefined) {
      console.error(`found unknown part id (does not exists) '${id}'. skipping ...`)
      continue
    }

    ret.push(part)
  }

  return ret
}
