/* eslint-disable no-restricted-syntax */
import * as fs from 'fs';

type Part = {
  file: string
  x: number
  y: number
  // scale?: number
}

type DocumentConfiguration = {
  width: number
  height: number
  parts: Part[]
}

function generate(config: DocumentConfiguration): string {
  let data: string = '';

  // fixme use some sort of dom generator
  // this is beyond horrible

  data += `<svg fill="none" width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">`;

  for (const part of config.parts) {
    // ${part.scale ? ` scale(${part.scale},${part.scale})` : ''}
    data += `<g transform="translate(${part.x},${part.y})">`;
    data += fs.readFileSync(part.file);
    data += '</g>';
  }

  data += '</svg>';

  return data;
}

(() => {
  const config: DocumentConfiguration = {
    width: 200,
    height: 200,
    parts: [
      {
        file: './circle.svg',
        x: 50,
        y: 0,
      },
    ],
  };

  const generatedSvg = generate(config);
  fs.writeFileSync('./output.svg', generatedSvg);
})();
