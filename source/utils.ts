import { readFileSync } from 'fs'

export function readJsonFileAs<T>(path: string): T {
  return JSON.parse(readFileSync(path).toString('utf8')) as T
}
