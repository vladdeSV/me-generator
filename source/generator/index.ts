import { DocumentConfiguration, generate, Part } from '../svg-combiner'
import fs from 'fs'

function randomElement<T>(array: T[]): T {
  return array[Math.trunc(Math.random() * array.length)]
}

function generateFacialHairIds(): (string | undefined)[] {
  const hair = randomWeightPart([
    'hair roff',
    'hair 1cm',
    'ltt touke',
  ])

  let beardPool = ['beard bigger', 'beard 3mm', undefined]
  if (hair === 'hair roff') {
    beardPool = beardPool.filter((item: string | undefined) => item !== 'beard 3mm')
  }

  const beard = randomElement(beardPool)
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

function selectRandomElementByWeight<T>(input: T[], weights: number[]): T {

  if (input.length !== weights.length) {
    throw new Error('input and weight lengths must match')
  }

  const aggregatedWeights = weights.map((sum => (value: number) => sum += value)(0))
  const weightTotal = Math.floor(Math.random() * weights.reduce((sum: number, weight) => sum + weight, 0))
  const index = aggregatedWeights.filter(el => weightTotal >= el).length

  return input[index]
}

function randomWeightPart(parts: (WeightedPart | PartId)[]): PartId | undefined {

  const weightedParts = parts
    .map(part => typeof part === 'string' ? { partId: part } : part)
    .map(part => {
      return { partId: part.partId, weight: part.weight ?? 1 }
    })

  const partIds = weightedParts.map(part => part.partId)
  const partWeights = weightedParts.map(part => part.weight)
  return selectRandomElementByWeight(partIds, partWeights)
}

const parts: PartMap = {
  'torso': {
    file: './resource/torso.svg',
    x: 399.4,
    y: 94.8,
  },
  'right leg': {
    file: './resource/right leg.svg',
    x: 336.1,
    y: 26.5,
  },
  'left leg': {
    file: './resource/left leg.svg',
    x: 47.7,
    y: 175.4,
  },
  'left arm': {
    file: './resource/left arm.svg',
    x: 683.9,
    y: 137.3,
  },
  'right arm': {
    file: './resource/right arm.svg',
    x: 490.9,
    y: 80.9,
  },
  'head': {
    file: './resource/head.svg',
    x: 654.3,
    y: 51.7,
  },
  'underwear 1': {
    file: './resource/underwear 1.svg',
    x: 403.9,
    y: 124.9,
  },
  'duality socks': {
    file: './resource/duality socks.svg',
    x: 46.7,
    y: 146.3,
  },
  'beige cargo pants': {
    file: './resource/beige cargo pants.svg',
    x: 147.5,
    y: 21.8,
  },
  'necklace': {
    file: './resource/necklace.svg',
    x: 641.4,
    y: 113.6,
  },
  'ltt crewneck': {
    file: './resource/ltt crewneck.svg',
    x: 471.8,
    y: 79.1,
  },
  'beard bigger': {
    file: './resource/beard bigger.svg',
    x: 649.5,
    y: 86.3,
  },
  'beard 3mm': {
    file: './resource/beard 3mm.svg',
    x: 649.5,
    y: 86.3,
  },
  'hair roff': {
    file: './resource/hair roff.svg',
    x: 671.5,
    y: 36.3,
  },
  'hair 1cm': {
    file: './resource/hair 1cm.svg',
    x: 675.3,
    y: 51.7,
  },
  'ltt touke': {
    file: './resource/ltt touke.svg',
    x: 664.1,
    y: 29.7,
  },
  'minibrills': {
    file: './resource/minibrills.svg',
    x: 671.1,
    y: 77,
  },
  'left hand': {
    file: './resource/left hand.svg',
    x: 695.2,
    y: 84,
  },
  'right hand': {
    file: './resource/right hand.svg',
    x: 539.4,
    y: 205.8,
  },
}

function generatePartsListFromIds(ids: (string | undefined)[], parts: PartMap): Part[] {
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

(() => {

  const config: DocumentConfiguration = {
    width: 850,
    height: 270,
    parts: generatePartsListFromIds([
      'torso',
      'right leg',
      'left leg',
      'left arm',
      'right arm',
      'head',
      'underwear 1',

      'duality socks',
      randomWeightPart(['beige cargo pants', { partId: undefined, weight: 0.1 }]),
      //'necklace',
      'ltt crewneck',
      ...generateFacialHairIds(),
      randomWeightPart(['minibrills', { partId: undefined, weight: 10 }]),

      'right hand',
      'left hand',
    ], parts),
  }

  const data = generate(config)
  fs.writeFileSync('output.svg', data)
  console.log('generated svg')
})()
