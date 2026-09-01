import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import * as path from 'node:path'
import { generate } from './generator'
import { RulebookSchema } from './rulebook'
import { type DocumentConfiguration, generate as generateSvg } from './svg-combiner'

function printUsage(): void {
  console.log(`usage: bun source/server.ts <rulebook-path> [options]

options:
  --port <number>    server port (default: 8000)
  --width <number>   canvas width (default: 850)
  --height <number>  canvas height (default: 270)`)
}

function parseArgs(argv: string[]): { rulebookPath: string; port: number; width: number; height: number } {
  const args = argv.slice(2)

  if (args.length === 0) {
    printUsage()
    process.exit(1)
  }

  let rulebookPath: string = ''
  let port = 8000
  let width = 850
  let height = 270

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const next = args[i + 1]
    switch (arg) {
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
        if (rulebookPath) {
          console.error(`unknown option: ${args[i]}`)
          printUsage()
          process.exit(1)
        }

        rulebookPath = String(arg)
    }
  }

  if (!rulebookPath) {
    console.error('missing rulebook path')
    printUsage()
    process.exit(1)
  }

  if (Number.isNaN(port) || Number.isNaN(width) || Number.isNaN(height)) {
    console.error('options must be valid numbers')
    printUsage()
    process.exit(1)
  }

  return { rulebookPath, port, width, height }
}

const { rulebookPath, port, width, height } = parseArgs(process.argv)

if (!existsSync(rulebookPath)) {
  console.error(`error: rulebook not found: ${rulebookPath}`)
  process.exit(1)
}

const data: unknown = JSON.parse(readFileSync(rulebookPath, 'utf8'))
const rulebook = RulebookSchema.parse(data)

rulebook.path = path.join(path.dirname(rulebookPath), rulebook.path ?? '.')

function validSeed(seed: string | null): string | undefined {
  if (seed && seed.trim() !== '') {
    return seed
  }
  return undefined
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname !== '/') {
      return new Response('not found', { status: 404 })
    }

    const seedParam = url.searchParams.get('seed')
    const seed = validSeed(seedParam) ?? randomBytes(8).toString('hex')

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
