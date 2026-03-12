import { z } from 'zod'

const PartSelectionSchema = z.union([
  z.string(),
  z.null(),
  z.object({
    partId: z.union([z.string(), z.null()]),
    weight: z.number(),
  }),
])

const BlocklistRuleSchema = z.tuple([z.string(), z.literal('disallow'), z.string()])

const IndexRuleSchema = z.tuple([z.string(), z.union([z.literal('over'), z.literal('under')]), z.string()])

export const RulebookSchema = z.object({
  path: z.string(),
  parts: z.record(z.string(), z.tuple([z.number(), z.number()])),
  generation: z.array(z.union([z.string(), z.array(PartSelectionSchema)])),
  blocklist: z.array(BlocklistRuleSchema),
  indexes: z.array(IndexRuleSchema),
})

export type BlocklistRule = z.infer<typeof BlocklistRuleSchema>
export type IndexRule = z.infer<typeof IndexRuleSchema>
export type Rulebook = z.infer<typeof RulebookSchema>
