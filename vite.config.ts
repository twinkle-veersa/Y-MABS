import { svgSpritemap } from 'vite-plugin-svg-spritemap';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    svgSpritemap({
      pattern: 'public/icons/*.svg',
      filename: 'public/sprite.svg',
      emit: true
    })
  ]
});
