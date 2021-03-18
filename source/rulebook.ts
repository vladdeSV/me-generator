type PartDefinitions = {
  [name: string]: [number, number]
}

export type PartSelection = string | null | {
  partId: string | null
  weight: number
}

export type Rulebook = {
  path: string
  parts: PartDefinitions
  generation: (string | PartSelection[])[]
  rules: [string, 'disallow', string][]
}