import { prng } from './index'
import { Part } from './svg-combiner'
import * as path from 'path'
import { Rulebook } from './rulebook'

export function generate(rng: prng, rulebook: Rulebook): Part[] {
  const ids: string[] = []

  for (const gen of rulebook.generation) {
    if (typeof gen === 'string') {
      ids.push(gen)
      continue
    }

    const foo: WeightedPart[] = []
    for (const a of gen) {
      if (a === null || typeof a !== 'object') {
        foo.push({ partId: a, weight: 1 })
        continue
      }

      foo.push(a)
    }

    const b = randomWeightPart(rng, foo)
    if (b === null) {
      continue
    }

    ids.push(b)

  }

  const partMap = generatePartMapFromJson(rulebook.path, rulebook.parts)

  return convertPartIdsToParts(ids, partMap)
}

type PartMap = {
  [name: string]: Part
}

type PartId = string
type WeightedPart = { partId: PartId | null, weight: number }

function selectRandomElementByWeight<T>(rng: prng, input: T[], weights: number[]): T {

  if (input.length !== weights.length) {
    throw new Error('input and weight lengths must match')
  }

  const aggregatedWeights = weights.map((sum => (value: number) => sum += value)(0))
  const weightTotal = rng() * weights.reduce((sum: number, weight) => sum + weight, 0)
  const index = aggregatedWeights.filter(el => weightTotal >= el).length

  return input[index]
}

function randomWeightPart(rng: prng, parts: (WeightedPart | PartId | null)[]): PartId | null {

  const weightedParts: (WeightedPart)[] = []

  for (const part of parts) {

    let weightedPart: WeightedPart

    if (part === null || typeof part !== 'object') {
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

function convertPartIdsToParts(ids: string[], parts: PartMap): Part[] {
  const ret: Part[] = []

  for (const id of ids) {

    const part = parts[id]

    if (part === undefined) {
      console.error(`found unknown part id (does not exists) '${id}'. skipping ...`)
      continue
    }

    ret.push(part)
  }

  return ret
}
