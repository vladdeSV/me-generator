import * as fs from 'fs'
import { readFileSync } from 'fs'
import { relative } from 'path'

export function readJsonFileAs<T>(path: string): T {
  return JSON.parse(readFileSync(path).toString('utf8')) as T
}

export type Part = {
  file: string
  x: number
  y: number
  scale?: number
}

export type DocumentConfiguration = {
  width: number
  height: number
  parts: (Part | null)[]
}

/// generate svg data
export function generate(config: DocumentConfiguration): string {
  let data = ''

  // fixme use some sort of dom generator
  // this is beyond horrible
  // ...
  // but it works!

  data += `<svg fill="none" width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">`

  for (const part of config.parts) {
    //
    data += `<g transform="translate(${part.x},${part.y})${part.scale ? ` scale(${part.scale})` : ''}">`
    data += fs.readFileSync(part.file)
    data += '</g>'
  }

  data += '</svg>'

  return data
}

(() => {
  const config: DocumentConfiguration = {
    width: 800,
    height: 230,
    parts: [
      {
        file: './body.svg',
        x: 10,
        y: 5,
      },
      {
        file: './tuke.svg',
        x: 618,
        y: 3,
      },
      {
        file: './north cap.svg',
        x: 592,
        y: 3,
      },
      {
        file: './left hand.svg',
        x: 644,
        y: 47,
      },
    ],
  }

  const data = generate(config)
  fs.writeFileSync('output.svg', data)
})()
