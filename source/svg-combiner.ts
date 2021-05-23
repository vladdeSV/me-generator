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

type XmlTag = {
  $?: { [name: string]: string }
  $$?: XmlTag[]
  '#name': string
}

type DefinedXmlTag = XmlTag & {
  $: { [name: string]: string }
  $$: XmlTag[]
}

// global parser options for this file
const options: xml2js.ParserOptions = Object.freeze({
  strict: true,
  explicitArray: false,
  explicitChildren: true,
  preserveChildrenOrder: true,
})

/// generate svg data
export async function generate(config: DocumentConfiguration, indexRules?: IndexRule[]): Promise<string> {

  // const namespaces = [] //todo: add all namespaces from all parts at the end
  const base: DefinedXmlTag = {
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
    const pseudoUniqueId = Math.random().toString(36).substr(2, 5)
    const svgData = fs.readFileSync(part.filePath, { encoding: 'utf-8' })
      .replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueId}`)

    const parseData = await xml2js.parseStringPromise(svgData, options)
    const data = parseData.svg as XmlTag | undefined

    if (!data) {
      console.log(`invalid svg '${part.name}'. skipping ...`)
      continue
    }

    for (const element of data.$$ ?? []) {

      element.$ = element.$ || {}

      const newElement = {
        $: {} as { [name: string]: string },
        $$: [] as XmlTag[],
        '#name': 'g',
      }

      newElement.$.parent = part.name
      newElement.$.id = element.$?.id

      if (newElement.$.transform) {
        console.log('found part which contains a transform. this is not yet supported')
      }

      newElement.$.transform = `translate(${part.x},${part.y})`

      if (data.$?.style) {
        newElement.$.style = data.$.style // fixme might override
      }

      newElement.$$.push(element)

      base.$$.push(newElement)
    }
  }

  if (base.$$ && indexRules) {
    base.$$ = rearrangeXmlTagsByIndexRules(base.$$, indexRules)
  }

  return xmlFromObject(base)
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

function rearrangeXmlTagsByIndexRules(tags: XmlTag[], indexRules: IndexRule[]): XmlTag[] {

  let mutableTags = tags.slice() // copy array

  for (const indexRule of indexRules) {

    const a = parsePartIdentifier(indexRule[0])
    const b = parsePartIdentifier(indexRule[2])
    const type = indexRule[1]

    if (!a) {
      console.log(`a, invalid identifier: '${indexRule[0]}'. skipping ...`)
      continue
    }

    if (!b) {
      console.log(`b, invalid identifier: '${indexRule[2]}'. skipping ...`)
      continue
    }

    if(type !== 'over' && type !== 'under') {
      console.log(`invalid placement operator '${type}'. skipping ...`)
      continue
    }

    // fixme: ugly as h*ck to divide array like this
    const shouldTagBeMoved = (child: XmlTag) => (child.$?.parent === a.partId) && (a.elementId ? child.$?.id === a.elementId : true)
    const tagsToBeMoved = tags.filter(x => shouldTagBeMoved(x))
    const tempRearrangedTags = mutableTags.filter(x => !shouldTagBeMoved(x))

    // after temporarily removing some tags, check if there are is a part left which matches this conditions
    const satisifiedSearchElement = tempRearrangedTags.find(x => {
      const childParentId = x.$?.parent
      const childElementId = x.$?.id
      return childParentId === b.partId && (b.elementId ? childElementId === b.elementId : true)
    })

    if (satisifiedSearchElement === undefined) {
      console.log('cannot find part with element id')
      continue
    }

    // insert tags at specified element
    tempRearrangedTags.splice(
      tempRearrangedTags.indexOf(satisifiedSearchElement) + (type === 'over' ? 1 : 0),
      0,
      ...tagsToBeMoved,
    )

    // update order of tags
    mutableTags = tempRearrangedTags
  }

  return mutableTags
}

type PartIdentifier = {
  partId: string
  elementId: string | undefined
}

function parsePartIdentifier(input: string): PartIdentifier | undefined {
  const regexResult = /^([ \w]+)(?:#(.+))?$/.exec(input)

  if (!regexResult?.[1]) {
    return undefined
  }

  const partId: string = regexResult[1]
  const elementId: string | undefined = regexResult[2]

  return {
    partId,
    elementId,
  }
}
