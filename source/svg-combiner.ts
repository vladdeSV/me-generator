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
export async function generate(config: DocumentConfiguration, indexRules?: IndexRule[]): Promise<string> {

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
    const svgData = fs.readFileSync(part.filePath, { encoding: 'utf-8' }).replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueSvgId}`)

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

  if (base.$$ && indexRules) {
    base.$$ = rearrangeXmlTagsByIndexRules(base.$$, indexRules)
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

export function rearrangeXmlTagsByIndexRules(tags: XmlTag[], indexes: IndexRule[]): XmlTag[] {

  let mutableTags = tags.slice() // copy array

  for (const indexRule of indexes) {

    const a = parsePartIdentifier(indexRule[0])
    const b = parsePartIdentifier(indexRule[2])
    const type: 'over' | 'under' = indexRule[1]

    if (!a) {
      console.log(`a, invalid identifier: '${indexRule[0]}'. skipping ...`)
      continue
    }

    if (!b) {
      console.log(`b, invalid identifier: '${indexRule[2]}'. skipping ...`)
      continue
    }

    // fixme: ugly as h*ck to divide array like this

    const shouldTagBeMoved = (child: XmlTag) => {
      let shouldBeMoved = true

      if (a.elementId) {
        shouldBeMoved = child.$?.id === a.elementId
      }

      return shouldBeMoved && (child.$?.parent === a.partId)
    }

    const tagsToBeMoved = tags.filter(x => shouldTagBeMoved(x))
    const tempRearranged = mutableTags.filter(x => !shouldTagBeMoved(x))

    const satisifiedElement = tempRearranged.find(x => {
      const childParentId = x.$?.parent
      const childElementId = x.$?.id
      return childParentId === b.partId && (b.elementId ? childElementId === b.elementId : true)
    })

    if (satisifiedElement === undefined) {
      console.log('cannot find part with element id')
      continue
    }

    // insert tags at specified element
    tempRearranged.splice(
      tempRearranged.indexOf(satisifiedElement) + (type === 'over' ? 1 : 0),
      0,
      ...tagsToBeMoved,
    )
    
    mutableTags = tempRearranged
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
