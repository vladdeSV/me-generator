/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as xml2js from 'xml2js'
import * as fs from 'fs'

const a = ((async (): Promise<void> => {
  
  const pseudoUniqueSvgId = Math.random().toString(36).substr(2, 5)
  const svgData = fs.readFileSync('../me-generator-images/exported/ltt crewneck.svg')
    .toString('utf8')
    .replace(/<\?xml.*?\?>/, '')
    .replace(/<!DOCTYPE.*?>/, '')
    .replace(/width="100%" height="100%" viewBox="0 0 (\d+) (\d+)"/, 'width="$1" height="$2"')
    .replace(/_clip(\d+)/g, `_clip$1_${pseudoUniqueSvgId}`)

  console.log(svgData)

  const options: xml2js.ParserOptions = {
    strict: true,
    explicitArray: false,
    preserveChildrenOrder: true,
  }

  const xml = await xml2js.parseStringPromise(svgData, options)

  fs.writeFileSync('./test.svg', buildXmlFromJs(xml.svg, 'svg'))

})())

function buildXmlFromJs(xml: any, tagName: string): string {

  console.log(xml)

  if(Array.isArray(xml)) {
    return xml.map(x => buildXmlFromJs(x, tagName)).join('')
  }

  if(typeof xml !== 'object') {
    return xml
  }

  const attributes: undefined | Record<string, any> = xml.$
  let attributesString: undefined | string

  if(attributes) {
    attributesString = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ')
    delete xml.$
  }

  const xmlTags = Object.keys(xml)

  if(xmlTags.length) {
    return `<${tagName}${attributesString ? ` ${attributesString}` : ''}>
  ${ xmlTags.map(tagName => buildXmlFromJs(xml[tagName], tagName)).join('\n') }
</${tagName}>`
  } else {
    return `<${tagName}${attributesString ? ` ${attributesString}` : ''}/>`
  }
}

console.log(a)
