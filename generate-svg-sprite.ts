import { globSync } from 'glob';
import fs from 'fs';
import { HTMLElement, parse } from 'node-html-parser';
import path from 'path';
import { type Config as SVGOConfig, optimize } from 'svgo';

const svgoConfig: SVGOConfig = {
  plugins: [
    {
      name: 'convertColors',
      params: {
        currentColor: true
      }
    }
  ]
};

const svgFiles = globSync('public/svgs/*.svg');
const symbols: string[] = [];

svgFiles.forEach(file => {
  const fileName = path.basename(file, '.svg');
  const code = fs.readFileSync(file, 'utf-8');
  const result = optimize(code, fileName === 'securemessaging' ? { plugins: [] } : svgoConfig).data;
  const svgElement = parse(result).querySelector('svg') as HTMLElement;
  const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;

  svgElement.childNodes.forEach(child => symbolElement.appendChild(child));

  symbolElement.setAttribute('id', fileName);

  for (const [name, value] of Object.entries(svgElement.attributes)) {
    if (!['id', 'xmlns', 'width', 'height'].includes(name)) {
      symbolElement.setAttribute(name, value);
    }
  }

  symbols.push(symbolElement.toString());
});

const svgSprite = `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`;

fs.writeFileSync('public/sprite.svg', svgSprite);
