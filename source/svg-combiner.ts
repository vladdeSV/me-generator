import * as fs from 'node:fs'
import * as xml2js from 'xml2js'
import type { IndexRule } from './rulebook'

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

type Attributes = Record<string, string>

type PartIdentifier = {
  partId: string
  elementId: string | undefined
}

const parserOptions: xml2js.ParserOptions = Object.freeze({
  strict: true,
  explicitArray: false,
  explicitChildren: true,
  preserveChildrenOrder: true,
})

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
      console.warn(`invalid svg '${part.name}', skipping`)
      continue
    }

    Object.assign(namespaces, namespacesFromXmlTag(data))

    for (const element of data.$$ ?? []) {
      const newElement = wrapInGroup(part, element)

      if (data.$?.style) {
        newElement.$.style = data.$.style
      }

      base.$$.push(newElement)
    }
  }

  for (const ns of Object.keys(namespaces)) {
    base.$[ns] = namespaces[ns]
  }

  if (indexRules && base.$$) {
    base.$$ = rearrangeXmlTagsByIndexRules(base.$$, indexRules)
  }

  return xmlFromObject(base)
}

function xmlFromObject(xml: XmlTag): string {
  const tagName = xml['#name']
  const attributes = xml.$ ?? {}
  const children = xml.$$

  const attributesString = Object.keys(attributes)
    .map(key => `${key}="${attributes[key]}"`)
    .join(' ')

  if (children === undefined) {
    return `<${tagName} ${attributesString}/>`
  }

  return `<${tagName} ${attributesString}>
  ${children.map(child => xmlFromObject(child)).join('\n')}
</${tagName}>`
}

async function parsePartToXmlTag(part: Part): Promise<XmlTag | undefined> {
  const uniqueId = Math.random().toString(36).substring(2, 7)
  const svgData = fs.readFileSync(part.filePath, { encoding: 'utf-8' }).replace(/_clip(\d+)/g, `_clip$1_${uniqueId}`)

  const parseData = await xml2js.parseStringPromise(svgData, parserOptions)
  return parseData.svg as XmlTag | undefined
}

function rearrangeXmlTagsByIndexRules(tags: XmlTag[], indexRules: IndexRule[]): XmlTag[] {
  let mutableTags = tags.slice()

  for (const indexRule of indexRules) {
    const a = parsePartIdentifier(indexRule[0])
    const b = parsePartIdentifier(indexRule[2])
    const type = indexRule[1]

    if (!a) {
      console.warn(`invalid identifier: '${indexRule[0]}', skipping`)
      continue
    }

    if (!b) {
      console.warn(`invalid identifier: '${indexRule[2]}', skipping`)
      continue
    }

    const shouldTagBeMoved = (child: XmlTag) =>
      child.$?.parent === a.partId && (a.elementId ? child.$?.id === a.elementId : true)
    const [tagsToBeMoved, tempRearrangedTags] = partition(mutableTags, shouldTagBeMoved)

    const targetElement = tempRearrangedTags.find(x => {
      const childParentId = x.$?.parent
      const childElementId = x.$?.id
      return childParentId === b.partId && (b.elementId ? childElementId === b.elementId : true)
    })

    if (targetElement === undefined) {
      console.warn('cannot find part with element id')
      continue
    }

    tempRearrangedTags.splice(
      tempRearrangedTags.indexOf(targetElement) + (type === 'over' ? 1 : 0),
      0,
      ...tagsToBeMoved
    )

    mutableTags = tempRearrangedTags
  }

  return mutableTags
}

function parsePartIdentifier(input: string): PartIdentifier | undefined {
  const regexResult = /^([ \w]+)(?:#(.+))?$/.exec(input)

  if (!regexResult?.[1]) {
    return undefined
  }

  return {
    partId: regexResult[1],
    elementId: regexResult[2],
  }
}

function namespacesFromXmlTag(data: XmlTag | undefined): Attributes {
  if (!data?.$) {
    return {}
  }

  const attributes = data.$
  const result: Attributes = {}

  for (const key of Object.keys(attributes)) {
    if (!key.includes('xmlns:')) {
      continue
    }

    const value = attributes[key]
    if (!value) {
      console.warn(`found falsy namespace for '${key}', skipping`)
      continue
    }

    result[key] = value
  }

  return result
}

function wrapInGroup(part: Part, element: XmlTag): DefinedXmlTag {
  element.$ = element.$ ?? {}

  return {
    '#name': 'g',
    $: {
      parent: part.name,
      id: element.$?.id,
      transform: `translate(${part.x},${part.y})`,
    },
    $$: [element],
  }
}

function partition<T>(array: T[], predicate: (x: T, index: number, array: T[]) => boolean): [T[], T[]] {
  const pass: T[] = []
  const fail: T[] = []

  for (let i = 0; i < array.length; i++) {
    ;(predicate(array[i], i, array) ? pass : fail).push(array[i])
  }

  return [pass, fail]
}
