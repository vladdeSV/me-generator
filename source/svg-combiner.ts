/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as fs from 'fs'
import * as xml2js from 'xml2js'

export type Part = {
  filePath: string
  x: number
  y: number
}

export type DocumentConfiguration = {
  width: number
  height: number
  parts: Part[]
}

/// generate svg data
export async function generate(config: DocumentConfiguration): Promise<string> {

  const base: XmlTag = {
    '#name': 'svg',
    $: {
      fill: 'none',
      width: String(config.width),
      height: String(config.height),
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:serif': 'http://www.serif.com/',
      'xmlns:xlink':'http://www.w3.org/1999/xlink',
    },
    $$: [],
  }

  for (const part of config.parts) {

    const pseudoUniqueSvgId = Math.random().toString(36).substr(2, 5)
    const svgData = fs.readFileSync(part.filePath)
      .toString('utf8')
      .replace(/<\?xml.*?\?>/, '')
      .replace(/<!DOCTYPE.*?>/, '')
      .replace(/width="100%" height="100%" viewBox="0 0 (\d+) (\d+)"/, 'width="$1" height="$2"')
      .replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueSvgId}`)

    const options: xml2js.ParserOptions = {
      strict: true,
      explicitArray: false,
      explicitChildren: true,
      preserveChildrenOrder: true,
    }

    const data = (await xml2js.parseStringPromise(svgData, options)).svg as XmlTag
    for (const child of data.$$ ?? []) {
      if(!child.$) {
        child.$ = {}
      }

      // todo: i am wildly copying tags from the parent svg.
      //       most likely i am missing a few
      
      if(data.$?.style) {
        child.$.style = data.$?.style
      }

      const translate = `translate(${part.x},${part.y})`
      child.$.transform = child.$.transform ? `${child.$.transform} ${translate}` : translate

      if(!base.$$) {
        throw new Error('we broke reality')
      }

      base.$$.push(child)
    }
  }

  return buildXmlFromJsOrderedChildren(base)
}

type XmlTag = {
  $?: {[name: string]: string}
  $$?: XmlTag[]
  '#name': string
}

/*
  Assuming XML parser options are:
    - strict: true,
    - explicitArray: false,
    - explicitChildren: true,
    - preserveChildrenOrder: true,
*/
function buildXmlFromJsOrderedChildren(xml: XmlTag): string {
  
  const tagName = xml['#name']
  const attributes = xml.$ ?? {}
  const children = xml.$$

  const attributesString = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ')

  if(children === undefined) {
    return `<${tagName} ${attributesString}/>`
  }

  return `<${tagName} ${attributesString}>
  ${children.map(child => buildXmlFromJsOrderedChildren(child)).join('\n')}
</${tagName}>`
}
