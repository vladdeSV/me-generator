import { readFileSync } from 'node:fs'
import type { z } from 'zod'

export function readJsonFile<T extends z.ZodType>(path: string, schema: T): z.infer<T> {
  const data: unknown = JSON.parse(readFileSync(path, 'utf8'))
  return schema.parse(data)
}
