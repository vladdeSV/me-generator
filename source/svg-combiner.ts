/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as fs from 'fs'
import * as xml2js from 'xml2js'
import { IndexRule } from './rulebook'

export type Part = {
  name: string
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
export async function generate(config: DocumentConfiguration, indexes?: IndexRule[]): Promise<string> {

  const base: XmlTag = {
    '#name': 'svg',
    $: {
      fill: 'none',
      width: String(config.width),
      height: String(config.height),
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:serif': 'http://www.serif.com/',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
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

    const partData = (await xml2js.parseStringPromise(svgData, options)).svg as XmlTag
    for (const element of partData.$$ ?? []) {

      element.$ = element.$ || {}

      const newElement = {
        $: {} as { [name: string]: string },
        $$: [] as XmlTag[],
        '#name': 'g',
      }

      newElement.$.parent = part.name
      newElement.$.id = element.$?.id
      newElement.$.transform = `translate(${part.x},${part.y})`

      if (partData.$?.style) {
        newElement.$.style = partData.$.style // fixme might override
      }

      if (!base.$$) {
        throw new Error('we broke reality')
      }

      newElement.$$.push(element)

      base.$$.push(newElement)
    }
  }

  if (base.$$ && indexes) {
    base.$$ = foo(base.$$, indexes)
  }

  return xmlFromObject(base)
}

type XmlTag = {
  $?: { [name: string]: string }
  $$?: XmlTag[]
  '#name': string
}

/*
  Assuming `xml2js` parser options are:
    - strict: true,
    - explicitArray: false,
    - explicitChildren: true,
    - preserveChildrenOrder: true,
*/
function xmlFromObject(xml: XmlTag): string {

  const tagName = xml['#name']
  const attributes = xml.$ ?? {}
  const children = xml.$$

  const attributesString = Object.keys(attributes).map(key => {
    return `${key}="${attributes[key]}"`
  }).join(' ')

  if (children === undefined) {
    return `<${tagName} ${attributesString}/>`
  }

  return `<${tagName} ${attributesString}>
  ${children.map(child => xmlFromObject(child)).join('\n')}
</${tagName}>`
}

export function foo(childElements: XmlTag[], indexes: IndexRule[]): XmlTag[] {

  const returnArray = childElements.slice()

  for (const indexRule of indexes) {

    const reg = /^(\w+)(?:#(.+))?$/.exec(indexRule[0])

    if (!reg?.[1]) {
      console.log(`unparseable rule '${indexRule[0]}'`)
      continue
    }

    const partId: string = reg[1]
    const elementId: string | undefined = reg[2]
    console.log(partId, elementId)

    /*
    for (const child of childElements) {

      if ()
    }
    */
  }

  /*
  // fixme: implement index rules
  const removed = a.splice(5, 1)
  if (removed) {
    a.splice(a.length - 5, 0, ...removed)
  }
  */

  return returnArray
}
