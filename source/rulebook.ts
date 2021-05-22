export type BlocklistRule = [string, 'disallow', string]
export type IndexRule = [string, 'over' | 'under', string]

type PartSelection = string | null | {
  partId: string | null
  weight: number
}

export type Rulebook = {
  path: string
  parts: { [name: string]: [number, number] }
  generation: (string | PartSelection[])[]
  blocklist: BlocklistRule[]
  indexes: IndexRule[]
}
