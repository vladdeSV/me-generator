/* eslint-disable no-restricted-syntax */
import * as fs from 'fs';

export type Part = {
  file: string
  x: number
  y: number
  scale?: number
}

export type DocumentConfiguration = {
  width: number
  height: number
  parts: Part[]
}

/// generate svg data
export function generate(config: DocumentConfiguration): string {
  let data: string = '';

  // fixme use some sort of dom generator
  // this is beyond horrible
  // ...
  // but it works!

  data += `<svg fill="none" width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">`;

  for (const part of config.parts) {
    //
    data += `<g transform="translate(${part.x},${part.y})${part.scale ? ` scale(${part.scale})` : ''}">`;
    data += fs.readFileSync(part.file);
    data += '</g>';
  }

  data += '</svg>';

  return data;
}
