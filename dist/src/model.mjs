export const SCHEMA_VERSION = 1;
export const SYSTEMS = [
  { id: 'orbit', name: 'Orbit Field', note: 'tidal rings + a quiet focal point' },
  { id: 'topo', name: 'Topographic Drift', note: 'contours cut through a warm horizon' },
  { id: 'modular', name: 'Modular Bloom', note: 'tiles fold into a graphic flower' },
];

export const PALETTES = {
  ember: { name: 'Ember / Night', colors: ['#100f16', '#f05d3f', '#f7b267', '#f7f3e8', '#6a2c70'] },
  tide: { name: 'Tide / Glass', colors: ['#081a2a', '#1b998b', '#a7fff0', '#f2f7f5', '#4b4e8d'] },
  moss: { name: 'Moss / Signal', colors: ['#111810', '#7bb661', '#d8f3a5', '#fff3c4', '#d05c3e'] },
  violet: { name: 'Violet / Smoke', colors: ['#181225', '#8e6bc9', '#e8b4f8', '#fff5ff', '#e95c91'] },
};

const DEFAULT_FONT = 'Arial';
const FONT_OPTIONS = ['Arial', 'Helvetica', 'Georgia', 'Courier New', 'Trebuchet MS'];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Number(value) : min));
}

export function hashSeed(seed) {
  let h = 2166136261;
  for (const char of String(seed)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function randomFrom(seed) {
  let value = hashSeed(seed) || 1;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function dimensionsFor(variant) {
  return variant === 'banner' ? { width: 2400, height: 960, label: 'BANNER' } : { width: 1400, height: 1400, label: 'SQUARE' };
}

export function createDefaultProject() {
  return {
    schema: SCHEMA_VERSION,
    name: 'Neon Tectonics',
    system: 'orbit',
    seed: 48291,
    palette: 'ember',
    variant: 'square',
    artist: 'MIRA / NORTH',
    title: 'NEON TECTONICS',
    subtitle: 'FIELD NOTES 01',
    fontFamily: DEFAULT_FONT,
    fontSize: 72,
    tracking: 8,
    align: 'left',
    textX: 9,
    textY: 84,
    inkOpacity: 0.96,
    accent: 0.68,
    rotation: -4,
  };
}

export function normalizeProject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Project must be a JSON object.');
  if (input.schema !== SCHEMA_VERSION) throw new Error(`Unsupported project version: ${input.schema ?? 'missing'}.`);
  const p = createDefaultProject();
  const textFields = ['name', 'artist', 'title', 'subtitle', 'fontFamily', 'align', 'system', 'palette', 'variant'];
  for (const key of textFields) if (key in input && typeof input[key] === 'string') p[key] = input[key].slice(0, 120);
  for (const key of ['seed', 'fontSize', 'tracking', 'textX', 'textY', 'inkOpacity', 'accent', 'rotation']) {
    if (key in input && Number.isFinite(Number(input[key]))) p[key] = Number(input[key]);
  }
  if (!SYSTEMS.some((item) => item.id === p.system)) throw new Error('Unknown composition system.');
  if (!PALETTES[p.palette]) throw new Error('Unknown palette.');
  if (!['square', 'banner'].includes(p.variant)) throw new Error('Unknown canvas variant.');
  if (!['left', 'center', 'right'].includes(p.align)) throw new Error('Unknown text alignment.');
  p.seed = Math.round(clamp(p.seed, 0, 99999999));
  p.fontSize = Math.round(clamp(p.fontSize, 30, 180));
  p.tracking = Math.round(clamp(p.tracking, -4, 32));
  p.textX = Math.round(clamp(p.textX, 4, 96));
  p.textY = Math.round(clamp(p.textY, 12, 94));
  p.inkOpacity = Number(clamp(p.inkOpacity, 0.25, 1).toFixed(2));
  p.accent = Number(clamp(p.accent, 0, 1).toFixed(2));
  p.rotation = Math.round(clamp(p.rotation, -18, 18));
  return p;
}

export function layoutReport(project) {
  const layout = textLayout(project);
  const safe = { left: layout.width * 0.055, right: layout.width * 0.945, top: layout.height * 0.055, bottom: layout.height * 0.945 };
  const overflowLines = Object.entries(layout.lines).filter(([, bounds]) => bounds.left < safe.left || bounds.right > safe.right || bounds.top < safe.top || bounds.bottom > safe.bottom).map(([name]) => name);
  return { titleOverflow: overflowLines.includes('title'), artistOverflow: overflowLines.includes('artist'), overflow: overflowLines.length > 0, overflowLines, titleWidth: layout.lines.title.width, artistWidth: layout.lines.artist.width, maxWidth: safe.right - safe.left, safe, dimensions: dimensionsFor(project.variant), lines: layout.lines, fontMetricsEstimated: true };
}

function estimatedTextWidth(text, size, tracking) {
  return String(text).length * size * 0.58 + Math.max(0, String(text).length - 1) * tracking;
}

function boundsFor(text, size, tracking, x, baseline, anchor) {
  const width = estimatedTextWidth(text, size, tracking);
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  return { left, right: left + width, top: baseline - size * 0.78, bottom: baseline + size * 0.18, width, baseline };
}

export function textLayout(project) {
  const { width, height } = dimensionsFor(project.variant);
  const titleSize = clamp(project.fontSize, 30, 180) * (project.variant === 'banner' ? 0.9 : 1);
  const artistSize = titleSize * 0.32;
  const subSize = titleSize * 0.23;
  const x = width * project.textX / 100;
  const titleY = height * project.textY / 100;
  const anchor = project.align === 'center' ? 'middle' : project.align === 'right' ? 'end' : 'start';
  return { width, height, x, titleY, titleSize, artistSize, subSize, anchor, lines: {
    artist: boundsFor(project.artist, artistSize, project.tracking * 0.55, x, titleY - titleSize * 1.05, anchor),
    title: boundsFor(project.title, titleSize, project.tracking, x, titleY, anchor),
    subtitle: boundsFor(project.subtitle, subSize, project.tracking * 0.8, x, titleY + titleSize * 0.7, anchor),
  } };
}

export function isSupportedFont(fontFamily) {
  return FONT_OPTIONS.includes(fontFamily);
}

export { FONT_OPTIONS };
