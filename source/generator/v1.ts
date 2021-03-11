import { prng } from './index'
import { Part, readJsonFileAs } from '../svg-combiner'
import * as path from 'path'

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

  const data = readJsonFileAs<{ [name: string]: [number, number] }>('./me-generator-images/source/position.json')
  const partMap = generatePartMapFromJson('./me-generator-images/', data)

  return convertPartIdsToParts(ids, partMap)
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

  const weightedParts: (WeightedPart)[] = []

  for (const part of parts) {

    let weightedPart: WeightedPart

    if (typeof part !== 'object') {
      weightedPart = { partId: part, weight: 1 }
    } else {
      weightedPart = part
    }

    weightedParts.push(weightedPart)
  }

  const partIds = weightedParts.map(part => part.partId)
  const partWeights = weightedParts.map(part => part.weight ?? 1)
  return selectRandomElementByWeight(rng, partIds, partWeights)
}

function generatePartMapFromJson(basePath: string, data: { [name: string]: [number, number] }): PartMap {
  const partMap: PartMap = {}

  for (const partId in data) {
    if (Object.prototype.hasOwnProperty.call(data, partId)) {
      const position = data[partId]

      partMap[partId] = {
        file: path.join(basePath, `${partId}.svg`),
        x: position[0],
        y: position[1],
      }
    }
  }

  return partMap
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
