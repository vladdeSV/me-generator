type PartDefinitions = {
  [name: string]: [number, number]
}

type PartSelection = string | null | {
  partId: string | null
  weight: number
}

export type Rulebook = {
  parts: PartDefinitions
  generation: (string | PartSelection[])[]
}
