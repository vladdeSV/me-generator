import { generate } from './generator'
import { DocumentConfiguration, generate as generateSvg } from './svg-combiner'
import express from 'express'
import { randomBytes } from 'crypto'

const app = express()
const PORT = 8000
app.get(
  '/',
  (req, res) => {

    const qseed = req.query.seed
    const seed = typeof qseed === 'string'
      ? qseed
      : randomBytes(8).toString('hex')

    console.log(`Generating by seed '${seed}'`)
    const config: DocumentConfiguration = {
      width: 850,
      height: 270,
      parts: generate(seed, '1-alpha'),
    }

    const data = generateSvg(config)

    //fs.writeFileSync('output.svg', data)
    res.header({
      'Content-Type': 'image/svg+xml',
    })

    return res.send(data)
  })
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
