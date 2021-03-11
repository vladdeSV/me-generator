import { generate } from './generator'
import { DocumentConfiguration, generate as generateSvg } from './svg-combiner'
import express from 'express'
import { randomBytes } from 'crypto'

const app = express()
const PORT = 8000

app.get(
  '/',
  (req, res) => {

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

    const verifyVersion = (version: unknown): string | undefined => {
      if (version === undefined) {
        return undefined
      }

      if (typeof version !== 'string') {
        throw new Error('Invalid version')

      }

      const validVersions = ['1-alpha']
      if (!validVersions.includes(version)) {
        throw new Error(`Invalid version '${version}'`)
      }

      return version
    }

    let seedParameter: string | undefined
    let versionParameter: string | undefined

    try {
      seedParameter = verifySeed(req.query.seed)
      versionParameter = verifyVersion(req.query.v)
    } catch (e) {
      res.statusCode = 400
      return res.send(e)
    }

    const seed = seedParameter ?? randomBytes(8).toString('hex')
    const version = versionParameter ?? '1-alpha'

    console.log(`Generating by version '${version}' and seed '${seed}'`)
    const config: DocumentConfiguration = {
      width: 850,
      height: 270,
      parts: generate(seed, version),
    }

    const data = generateSvg(config)

    res.header({
      'Content-Type': 'image/svg+xml',
    })

    return res.send(data)
  },
)
app.listen(PORT, () => {
  console.log(`[server]: server running at http://localhost:${PORT}`)
})
