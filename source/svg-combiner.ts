import * as fs from 'fs'

export type Part = {
  file: string
  x: number
  y: number
}

export type DocumentConfiguration = {
  width: number
  height: number
  parts: Part[]
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

    data += `<g transform="translate(${part.x},${part.y})">`

    const pseudoUniqueSvgId = Math.random().toString(36).substr(2, 5)

    const svgData = fs.readFileSync(part.file)
      .toString('utf8')
      .replace(/<\?xml.*?\?>/, '')
      .replace(/<!DOCTYPE.*?>/, '')
      .replace(/width="100%" height="100%" viewBox="0 0 (\d+) (\d+)"/, 'width="$1" height="$2"')
      .replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueSvgId}`)

    data += svgData
    data += '</g>'
  }

  data += '</svg>'

  return data
}
