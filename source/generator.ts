import { Part } from './svg-combiner'
import { Rulebook } from './rulebook'
import * as path from 'path'
import seedrandom from 'seedrandom'

export function generate(rulebook: Rulebook, seed: string): Part[] {

  const rng = seedrandom(seed)
  const ids = partIdsFromRulebook(rng, rulebook)
  const partMap = partMapFromJson(rulebook.path, rulebook.parts)

  return convertPartIdsToParts(ids, partMap)
}

type PseudoRandomNumberGenerator = () => number
type PartMap = { [name: string]: Part }
type PartId = string
type WeightedPart = { partId: PartId | null, weight: number }

function partIdsFromRulebook(rng: PseudoRandomNumberGenerator, rulebook: Rulebook): string[] {
  const ids: string[] = []
  const blacklistedIds: string[] = []

  const generation = rulebook.generation
  for (const gen of generation) {
    let weightedParts: WeightedPart[] = []

    if (typeof gen === 'string') {
      weightedParts.push({ partId: gen, weight: 1 })
    } else {

      for (const part of gen) {
        if (part === null || typeof part !== 'object') {

          weightedParts.push({ partId: part, weight: 1 })
          continue
        }

        weightedParts.push(part)
      }
    }

    weightedParts = weightedParts.filter(x => !blacklistedIds.includes(x.partId as string))

    const partId = randomWeightPart(rng, weightedParts)
    if (partId === null) {
      continue
    }

    for (const rule of rulebook.blocklist ?? []) {
      const foo = rule[0]
      if (partId === foo) {
        console.log(`${partId} blacklists ${rule[2]}`)

        blacklistedIds.push(rule[2])
      }
    }

    ids.push(partId)
  }

  return ids
}

function selectRandomElementByWeight(rng: PseudoRandomNumberGenerator, input: (PartId | null)[], weights: number[]): PartId | null {
  if (input.length !== weights.length) {
    throw new Error('input and weight lengths must match')
  }

  if (input.length === 0) {
    return null
  }

  const aggregatedWeights = weights.map((sum => (value: number) => sum += value)(0))
  const weightTotal = rng() * weights.reduce((sum: number, weight) => sum + weight, 0)
  const index = aggregatedWeights.filter(el => weightTotal >= el).length

  const partId = input[index]
  if (partId === undefined) {
    throw new Error() // fixme: better error
  }

  return partId
}

function randomWeightPart(rng: PseudoRandomNumberGenerator, parts: (WeightedPart | PartId | null)[]): PartId | null {
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

function partMapFromJson(basePath: string, data: { [name: string]: [number, number] }): PartMap {
  const partMap: PartMap = {}

  for (const partId in data) {
    if (Object.prototype.hasOwnProperty.call(data, partId)) {
      const position = data[partId]

      if (position === undefined) {
        throw new Error() // fixme: better error
      }

      partMap[partId] = {
        name: partId,
        filePath: path.join(basePath, `${partId}.svg`),
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
