/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as xml2js from 'xml2js'
import * as fs from 'fs'
import { inspect } from 'util'

(async () => {
  
  const pseudoUniqueSvgId = Math.random().toString(36).substr(2, 5)
  const svgData = fs.readFileSync('../me-generator-images/exported/beard 3mm.svg')
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

  const data = (await xml2js.parseStringPromise(svgData, options)).svg
  console.log(JSON.stringify(data))

  const newXml = buildXmlFromJsOrderedChildren(data)
  console.log(newXml)

  fs.writeFileSync('./test.svg', `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  ` + newXml)

})()

type XmlTag = {
  $?: {[name: string]: XmlTag}
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

  return `<${tagName} ${attributesString}>${children.map(child => buildXmlFromJsOrderedChildren(child)).join('')}</${tagName}>`
}

