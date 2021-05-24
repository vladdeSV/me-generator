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
  '#name': string
  $?: Attributes
  $$?: XmlTag[]
}

type DefinedXmlTag = XmlTag & {
  $: Attributes
  $$: XmlTag[]
}

type Attributes = {
  [name: string]: string
}

type PartIdentifier = {
  partId: string
  elementId: string | undefined
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

  const base: DefinedXmlTag = {
    '#name': 'svg',
    $: {
      fill: 'none',
      width: String(config.width),
      height: String(config.height),
      xmlns: 'http://www.w3.org/2000/svg',
    },
    $$: [],
  }

  const namespaces: Attributes = {}

  for (const part of config.parts) {
    const data = await parsePartToXmlTag(part)

    if (!data) {
      console.warn(`invalid svg '${part.name}'. skipping ...`)
      continue
    }

    // copy svg's namespaces onto temp global namespace
    Object.assign(namespaces, namespacesFromXmlTag(data)) // todo might overwrite

    for (const element of data.$$ ?? []) {
      const newElement = combinedXmlTagChild(part, element)

      if (data.$?.style) {
        newElement.$.style = data.$.style
      }

      base.$$.push(newElement)
    }
  }

  // apply all new namespaces to global namespace
  for (const ns of Object.keys(namespaces)) {
    base.$[ns] = namespaces[ns]
  }

  if (indexRules && base.$$) {
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

async function parsePartToXmlTag(part: Part): Promise<XmlTag | undefined> {
  const pseudoUniqueId = Math.random().toString(36).substr(2, 5)
  const svgData = fs.readFileSync(part.filePath, { encoding: 'utf-8' })
    .replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueId}`)

  const parseData = await xml2js.parseStringPromise(svgData, options)
  const data = parseData.svg as XmlTag | undefined

  return data
}

function rearrangeXmlTagsByIndexRules(tags: XmlTag[], indexRules: IndexRule[]): XmlTag[] {

  let mutableTags = tags.slice() // copy array

  for (const indexRule of indexRules) {

    const a = parsePartIdentifier(indexRule[0])
    const b = parsePartIdentifier(indexRule[2])
    const type = indexRule[1] as string

    if (!a) {
      console.log(`a, invalid identifier: '${indexRule[0]}'. skipping ...`)
      continue
    }

    if (!b) {
      console.log(`b, invalid identifier: '${indexRule[2]}'. skipping ...`)
      continue
    }

    if (type !== 'over' && type !== 'under') {
      console.error(`invalid placement operator '${type}'. skipping ...`)
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

function namespacesFromXmlTag(data: XmlTag | undefined): Attributes {
  if (!data?.$) {
    return {}
  }

  const attributes = data.$
  const ret: Attributes = {}

  for (const attribute of Object.keys(attributes)) {
    const isAttributeNamespace = (x: string) => x.includes('xmlns:')
    if (!isAttributeNamespace(attribute)) {
      continue
    }

    const namespaceKey = attribute // reassign for readable code
    const namespaceValue = attributes[namespaceKey]

    if (!namespaceValue) {
      console.warn(`found falsy namespace for '${namespaceKey}'. skipping ...`)
      continue
    }

    ret[attribute] = namespaceValue
  }

  return ret
}

function combinedXmlTagChild(part: Part, element: XmlTag): DefinedXmlTag {
  element.$ = element.$ || {}

  const newElement: DefinedXmlTag = {
    '#name': 'g',
    $: {},
    $$: [],
  }

  newElement.$.parent = part.name
  newElement.$.id = element.$?.id

  if (newElement.$.transform) {
    console.log('found part which contains a transform. this is not yet supported')
  }

  newElement.$.transform = `translate(${part.x},${part.y})`
  newElement.$$.push(element)

  return newElement
}
