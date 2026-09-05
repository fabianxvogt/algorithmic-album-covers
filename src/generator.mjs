import { PALETTES, dimensionsFor, randomFrom, clamp } from './model.mjs';

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

function point(cx, cy, radius, angle) {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function orbitShapes(width, height, project, colors) {
  const rnd = randomFrom(`${project.seed}:orbit`);
  const cx = width * (project.variant === 'banner' ? 0.72 : 0.54);
  const cy = height * 0.47;
  const base = Math.min(width, height) * 0.33;
  let out = `<circle cx="${cx}" cy="${cy}" r="${base * 1.12}" fill="${colors[4]}" opacity=".25"/>`;
  for (let ring = 0; ring < 9; ring += 1) {
    const radius = base * (0.34 + ring * 0.095);
    const wobble = 0.035 + rnd() * 0.09;
    const points = [];
    for (let i = 0; i <= 76; i += 1) {
      const a = (i / 76) * Math.PI * 2;
      const r = radius * (1 + Math.sin(a * (3 + ring % 4) + rnd() * 2) * wobble);
      const [x, y] = point(cx, cy, r, a + project.rotation * 0.01);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    out += `<polyline points="${points.join(' ')}" fill="none" stroke="${colors[ring % 2 ? 2 : 1]}" stroke-width="${Math.max(3, width * .003)}" opacity="${(0.25 + ring * .055).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 28; i += 1) {
    const angle = rnd() * Math.PI * 2;
    const radius = base * (0.22 + rnd() * 0.72);
    const [x, y] = point(cx, cy, radius, angle);
    const size = width * (0.004 + rnd() * 0.012);
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${colors[i % 3 + 1]}" opacity="${(0.35 + rnd() * .55).toFixed(2)}"/>`;
  }
  out += `<circle cx="${cx}" cy="${cy}" r="${base * .085}" fill="${colors[3]}"/><circle cx="${cx}" cy="${cy}" r="${base * .04}" fill="${colors[1]}"/>`;
  return out;
}

function topoShapes(width, height, project, colors) {
  const rnd = randomFrom(`${project.seed}:topo`);
  let out = `<rect width="${width}" height="${height}" fill="${colors[4]}" opacity=".18"/>`;
  const bands = 20;
  for (let band = 0; band < bands; band += 1) {
    const y = height * (0.06 + band * 0.047);
    const points = [];
    for (let i = 0; i <= 48; i += 1) {
      const x = (i / 48) * width;
      const wave = Math.sin(i * 0.62 + project.seed * .001 + band * .41) * height * .05;
      const wave2 = Math.sin(i * .19 + band) * height * .025;
      points.push(`${x.toFixed(1)},${(y + wave + wave2).toFixed(1)}`);
    }
    out += `<polyline points="${points.join(' ')}" fill="none" stroke="${colors[band % 3 + 1]}" stroke-width="${Math.max(3, width * .0025)}" opacity="${(0.2 + (band % 5) * .11).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 8; i += 1) {
    const x = width * (0.08 + rnd() * .84);
    const y = height * (0.2 + rnd() * .52);
    const radius = Math.min(width, height) * (.07 + rnd() * .1);
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="${colors[1]}" opacity=".12"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(radius * .4).toFixed(1)}" fill="${colors[2]}" opacity=".38"/>`;
  }
  out += `<path d="M0 ${height * .82} Q ${width * .28} ${height * .62}, ${width * .53} ${height * .79} T ${width} ${height * .68} L ${width} ${height} L0 ${height}Z" fill="${colors[0]}" opacity=".66"/>`;
  return out;
}

function modularShapes(width, height, project, colors) {
  const rnd = randomFrom(`${project.seed}:modular`);
  const cols = project.variant === 'banner' ? 15 : 10;
  const rows = project.variant === 'banner' ? 6 : 10;
  const gap = width * .012;
  const cell = Math.min((width - gap * (cols + 1)) / cols, (height - gap * (rows + 1)) / rows);
  const ox = (width - (cell * cols + gap * (cols + 1))) / 2 + gap;
  const oy = (height - (cell * rows + gap * (rows + 1))) / 2 + gap;
  let out = '';
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) {
    const v = (x * 17 + y * 23 + project.seed) % 11;
    const size = cell * (0.35 + (v / 11) * .55);
    const px = ox + x * (cell + gap) + (cell - size) / 2;
    const py = oy + y * (cell + gap) + (cell - size) / 2;
    const color = colors[(v + Math.floor(rnd() * 2)) % 4 + 1];
    const rotate = (v % 2 ? 45 : 0) + project.rotation;
    const shape = v % 3 === 0 ? `<circle cx="${(px + size / 2).toFixed(1)}" cy="${(py + size / 2).toFixed(1)}" r="${(size / 2).toFixed(1)}" fill="${color}"/>` : `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" rx="${(size * .08).toFixed(1)}" fill="${color}" transform="rotate(${rotate} ${(px + size / 2).toFixed(1)} ${(py + size / 2).toFixed(1)})"/>`;
    out += `<g opacity="${(.22 + (v % 6) * .11).toFixed(2)}">${shape}</g>`;
  }
  out += `<path d="M${width * .08} ${height * .78} L${width * .4} ${height * .28} L${width * .67} ${height * .73} L${width * .91} ${height * .2}" fill="none" stroke="${colors[3]}" stroke-width="${width * .012}" opacity=".72"/>`;
  return out;
}

export function createSvg(project) {
  const { width, height } = dimensionsFor(project.variant);
  const colors = PALETTES[project.palette]?.colors ?? PALETTES.ember.colors;
  const scene = project.system === 'topo' ? topoShapes(width, height, project, colors) : project.system === 'modular' ? modularShapes(width, height, project, colors) : orbitShapes(width, height, project, colors);
  const font = esc(project.fontFamily || 'Arial');
  const anchor = project.align === 'center' ? 'middle' : project.align === 'right' ? 'end' : 'start';
  const tx = width * project.textX / 100;
  const titleY = height * project.textY / 100;
  const titleSize = clamp(project.fontSize, 30, 180) * (project.variant === 'banner' ? .9 : 1);
  const artistSize = titleSize * .32;
  const subSize = titleSize * .23;
  const accentWidth = width * (.22 + project.accent * .3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" color-interpolation="sRGB" shape-rendering="geometricPrecision" role="img" aria-label="${esc(project.artist)} — ${esc(project.title)}"><rect width="${width}" height="${height}" fill="${colors[0]}"/>${scene}<rect width="${width}" height="${height}" fill="${colors[0]}" opacity=".12"/><g fill="${colors[3]}" font-family="${font}" text-anchor="${anchor}" opacity="${project.inkOpacity}"><text x="${tx}" y="${titleY - titleSize * 1.05}" font-size="${artistSize}" letter-spacing="${project.tracking * .55}px" font-weight="700">${esc(project.artist)}</text><text x="${tx}" y="${titleY}" font-size="${titleSize}" letter-spacing="${project.tracking}px" font-weight="700">${esc(project.title)}</text><text x="${tx}" y="${titleY + titleSize * .7}" font-size="${subSize}" letter-spacing="${project.tracking * .8}px">${esc(project.subtitle)}</text></g><rect x="${tx}" y="${titleY + titleSize * .95}" width="${accentWidth}" height="${Math.max(5, width * .004)}" fill="${colors[1]}" opacity=".9"/><g fill="${colors[3]}" font-family="${font}" font-size="${Math.max(14, width * .011)}" letter-spacing="${Math.max(2, width * .002)}" opacity=".72"><text x="${width * .055}" y="${height * .94}">CF / ${dimensionsFor(project.variant).label}</text><text x="${width * .945}" y="${height * .94}" text-anchor="end">${String(project.seed).padStart(6, '0')}</text></g></svg>`;
}

export function svgBlob(project) {
  return new Blob([createSvg(project)], { type: 'image/svg+xml;charset=utf-8' });
}
