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
  const dimensions = dimensionsFor(project.variant);
  const maxWidth = dimensions.width * (project.variant === 'banner' ? 0.48 : 0.66);
  const titleWidth = project.title.length * project.fontSize * 0.58 + Math.max(0, project.title.length - 1) * project.tracking;
  const artistWidth = project.artist.length * project.fontSize * 0.25 + Math.max(0, project.artist.length - 1) * project.tracking * 0.35;
  const titleOverflow = titleWidth > maxWidth;
  const artistOverflow = artistWidth > maxWidth;
  return { titleOverflow, artistOverflow, overflow: titleOverflow || artistOverflow, titleWidth, artistWidth, maxWidth, dimensions };
}

export function isSupportedFont(fontFamily) {
  return FONT_OPTIONS.includes(fontFamily);
}

export { FONT_OPTIONS };
