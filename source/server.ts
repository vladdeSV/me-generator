import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import * as path from 'node:path'
import { generate } from './generator'
import type { Rulebook } from './rulebook'
import { type DocumentConfiguration, generate as generateSvg } from './svg-combiner'
import { readJsonFileAs } from './utils'

function printUsage(): void {
  console.log(`usage: bun source/server.ts <rulebook-path> [options]

options:
  --port <number>    server port (default: 8000)
  --width <number>   canvas width (default: 850)
  --height <number>  canvas height (default: 270)`)
}

function parseArgs(argv: string[]): { rulebookPath: string; port: number; width: number; height: number } {
  const args = argv.slice(2)

  if (args.length === 0 || args[0].startsWith('--')) {
    printUsage()
    process.exit(1)
  }

  const rulebookPath = args[0]
  let port = 8000
  let width = 850
  let height = 270

  for (let i = 1; i < args.length; i++) {
    const next = args[i + 1]
    switch (args[i]) {
      case '--port':
        port = Number(next)
        i++
        break
      case '--width':
        width = Number(next)
        i++
        break
      case '--height':
        height = Number(next)
        i++
        break
      default:
        console.error(`unknown option: ${args[i]}`)
        printUsage()
        process.exit(1)
    }
    if (Number.isNaN(port) || Number.isNaN(width) || Number.isNaN(height)) {
      console.error('options must be valid numbers')
      printUsage()
      process.exit(1)
    }
  }

  return { rulebookPath, port, width, height }
}

const { rulebookPath, port, width, height } = parseArgs(process.argv)

if (!existsSync(rulebookPath)) {
  console.error(`error: rulebook not found: ${rulebookPath}`)
  process.exit(1)
}

const rulebook: Rulebook = readJsonFileAs<Rulebook>(rulebookPath)
rulebook.path = path.join(path.dirname(rulebookPath), rulebook.path === undefined ? '.' : rulebook.path)

function verifySeed(seed: string | null): string | undefined {
  if (seed === null) {
    return undefined
  }

  if (seed.trim() === '') {
    return undefined
  }

  return seed
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname !== '/') {
      return new Response('not found', { status: 404 })
    }

    const seedParam = url.searchParams.get('seed')
    const seed = verifySeed(seedParam) ?? randomBytes(8).toString('hex')

    console.log(`generating with seed: '${seed}'`)

    const documentConfiguration: DocumentConfiguration = {
      width,
      height,
      parts: generate(rulebook, seed),
    }

    const data = await generateSvg(documentConfiguration, rulebook.indexes)

    return new Response(data, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'max-age=600',
        'X-Seed': seed,
      },
    })
  },
})

console.log(`[server]: server running at http://localhost:${port}`)
