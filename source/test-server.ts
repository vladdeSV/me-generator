/* eslint-disable @typescript-eslint/no-misused-promises */
import { DocumentConfiguration, generate as generateSvg } from './svg-combiner'
import { randomBytes } from 'crypto'
import { generate } from './generator'
import * as path from 'path'
import { Rulebook } from './rulebook'
import { readJsonFileAs } from './utils'
import express from 'express'

(() => {
  const app = express()
  const PORT = 8000

  app.get(
    '/',
    async (req, res): Promise<any> => {

      const verifySeed = (seed: unknown): string | undefined => {

        if (seed === undefined) {
          return undefined
        }

        if (typeof seed !== 'string') {
          throw new Error('Invalid seed')
        }

        if (seed.trim() === '') {
          return undefined
        }

        return seed
      }

      let seedParameter: string | undefined

      try {
        seedParameter = verifySeed(req.query.seed)
      } catch (e) {
        res.statusCode = 400
        return res.send(e)
      }

      const seed = seedParameter ?? randomBytes(8).toString('hex')

      const config = readJsonFileAs<{ rulebook: string }>('./config.json')
      const rulebookPath = config.rulebook
      const rulebook: Rulebook = readJsonFileAs<Rulebook>(rulebookPath)

      rulebook.path = path.join(path.dirname(rulebookPath), rulebook.path === undefined ? '.' : rulebook.path)
      console.log(`Generating by seed '${seed}'`)
      const documentConfiguration: DocumentConfiguration = {
        width: 850,
        height: 270,
        parts: generate(rulebook, seed),
      }

      const data = await generateSvg(documentConfiguration, rulebook.indexes)

      res.header({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'max-age=600',
        'X-Seed': seed,
      })

      return res.send(data)
    },
  )
  app.listen(PORT, () => {
    console.log(`[server]: server running at http://localhost:${PORT}`)
  })
})()

type Config = D.TypeOf<typeof Config>
const Config = D.struct({
  rulebook: D.string,
  width: D.number,
  height: D.number,
})
