import { dimensionsFor } from './model.mjs';

export function exportContract(project) {
  const { width, height } = dimensionsFor(project.variant);
  return { width, height, color: 'sRGB', format: 'SVG/PNG' };
}

export async function svgToPngBlob(project, svgText) {
  const { width, height } = dimensionsFor(project.variant);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('This browser cannot create a canvas export.');
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('The browser could not rasterize this SVG.')); image.src = url; });
    ctx.drawImage(image, 0, 0, width, height);
    return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export returned no data.')), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}
