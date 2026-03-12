import * as path from 'node:path'
import seedrandom from 'seedrandom'
import type { Rulebook } from './rulebook'
import type { Part } from './svg-combiner'

export function generate(rulebook: Rulebook, seed: string): Part[] {
  const rng = seedrandom(seed)
  const ids = partIdsFromRulebook(rng, rulebook)
  const partMap = buildPartMap(rulebook.path, rulebook.parts)

  return resolvePartIds(ids, partMap)
}

type Rng = () => number
type PartMap = Record<string, Part>
type PartId = string
type WeightedPart = { partId: PartId | null; weight: number }

function partIdsFromRulebook(rng: Rng, rulebook: Rulebook): string[] {
  const ids: string[] = []
  const blockedIds: string[] = []

  for (const gen of rulebook.generation) {
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

    weightedParts = weightedParts.filter(x => !blockedIds.includes(x.partId as string))

    const partId = selectByWeight(rng, weightedParts)
    if (partId === null) {
      continue
    }

    for (const rule of rulebook.blocklist ?? []) {
      if (partId === rule[0]) {
        console.log(`${partId} blocks ${rule[2]}`)
        blockedIds.push(rule[2])
      }
    }

    ids.push(partId)
  }

  return ids
}

function selectByWeight(rng: Rng, parts: WeightedPart[]): PartId | null {
  if (parts.length === 0) {
    return null
  }

  const weights = parts.map(p => p.weight ?? 1)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let remaining = rng() * total

  for (let i = 0; i < parts.length; i++) {
    remaining -= weights[i]
    if (remaining < 0) {
      return parts[i].partId
    }
  }

  return parts[parts.length - 1].partId
}

function buildPartMap(basePath: string, data: Record<string, [number, number]>): PartMap {
  const partMap: PartMap = {}

  for (const [partId, position] of Object.entries(data)) {
    partMap[partId] = {
      name: partId,
      filePath: path.join(basePath, `${partId}.svg`),
      x: position[0],
      y: position[1],
    }
  }

  return partMap
}

function resolvePartIds(ids: string[], parts: PartMap): Part[] {
  const resolved: Part[] = []

  for (const id of ids) {
    const part = parts[id]

    if (part === undefined) {
      console.error(`unknown part id '${id}', skipping`)
      continue
    }

    resolved.push(part)
  }

  return resolved
}
