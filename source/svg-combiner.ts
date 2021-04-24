/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
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

  // returns a window with a document and an svg root node
  const { createSVGWindow } = require('svgdom')
  const window = createSVGWindow()
  const document = window.document
  const { SVG, registerWindow } = require('@svgdotjs/svg.js')

  registerWindow(window, document)
  const root = SVG(document.documentElement).width(config.width).height(config.height)

  root.rect(100, 100).fill('yellow').move(50, 50)

  for (const part of config.parts) {

  }

  return root.svg()

  // data += `<svg fill="none" width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">`
  // for (const part of config.parts) {
  //   data += `<g transform="translate(${part.x},${part.y})">`
  //   const pseudoUniqueSvgId = Math.random().toString(36).substr(2, 5)
  //   const svgData = fs.readFileSync(part.file)
  //     .toString('utf8')
  //     .replace(/<\?xml.*?\?>/, '')
  //     .replace(/<!DOCTYPE.*?>/, '')
  //     .replace(/width="100%" height="100%" viewBox="0 0 (\d+) (\d+)"/, 'width="$1" height="$2"')
  //     .replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueSvgId}`)
  //   data += svgData
  //   data += '</g>'
  // }
  // data += '</svg>'
  // return data
}
