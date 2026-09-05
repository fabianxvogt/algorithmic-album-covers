import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProject, dimensionsFor, layoutReport, normalizeProject, PALETTES } from '../src/model.mjs';
import { createSvg } from '../src/generator.mjs';
import { projectFromJson, projectToJson } from '../src/serialize.mjs';
import { exportContract } from '../src/export.mjs';

test('all three composition systems are deterministic and distinct', () => {
  const base = createDefaultProject();
  const outputs = ['orbit', 'topo', 'modular'].map((system) => createSvg({ ...base, system }));
  assert.equal(createSvg({ ...base, system: 'orbit' }), outputs[0]);
  assert.equal(new Set(outputs).size, 3);
  outputs.forEach((svg) => assert.match(svg, /^<svg[^>]+width="1400"[^>]+height="1400"/));
});

test('seed changes geometry while keeping output finite and bounded', () => {
  const base = createDefaultProject();
  const svg = createSvg({ ...base, seed: 991122 });
  assert.notEqual(svg, createSvg({ ...base, seed: 991123 }));
  assert.ok(svg.length < 250000);
  assert.doesNotMatch(svg, /NaN|Infinity/);
  const numbers = [...svg.matchAll(/(?:x|y|cx|cy|r|width|height)="(-?\d+(?:\.\d+)?)"/g)].map((match) => Number(match[1]));
  assert.ok(numbers.every((number) => Number.isFinite(number)));
});

test('layout report exposes overflow for long release text', () => {
  const report = layoutReport({ ...createDefaultProject(), title: 'A VERY LONG TITLE THAT DOES NOT FIT ON THIS COVER', fontSize: 160, tracking: 30 });
  assert.equal(report.overflow, true);
  assert.ok(report.titleWidth > report.maxWidth);
});

test('project JSON round trip preserves the exact editable recipe', () => {
  const project = normalizeProject({ ...createDefaultProject(), system: 'modular', palette: 'tide', variant: 'banner', seed: 123456, title: 'GLASS / SIGNAL', tracking: 12 });
  assert.deepEqual(projectFromJson(projectToJson(project)), project);
});

test('malformed and unsupported imports reject without producing a project', () => {
  assert.throws(() => projectFromJson('{oops'), /valid JSON/);
  assert.throws(() => projectFromJson(JSON.stringify({ format: 'cover-foundry-project', schema: 999, project: {} })), /supported/);
  assert.throws(() => projectFromJson(JSON.stringify({ format: 'cover-foundry-project', schema: 1, project: { schema: 1, system: 'not-real' } })), /system/);
});

test('normalization clamps user edits to safe bounds', () => {
  const project = normalizeProject({ ...createDefaultProject(), seed: -4, fontSize: 900, tracking: -90, textX: 999, textY: -2, inkOpacity: 8, accent: -3, rotation: 88 });
  assert.deepEqual({ seed: project.seed, fontSize: project.fontSize, tracking: project.tracking, textX: project.textX, textY: project.textY, inkOpacity: project.inkOpacity, accent: project.accent, rotation: project.rotation }, { seed: 0, fontSize: 180, tracking: -4, textX: 96, textY: 12, inkOpacity: 1, accent: 0, rotation: 18 });
});

test('preview and export contract agree for square and banner', () => {
  for (const variant of ['square', 'banner']) {
    const project = { ...createDefaultProject(), variant };
    const contract = exportContract(project);
    const svg = createSvg(project);
    assert.equal(contract.width, dimensionsFor(variant).width);
    assert.equal(contract.height, dimensionsFor(variant).height);
    assert.match(svg, new RegExp(`width="${contract.width}"`));
    assert.match(svg, new RegExp(`height="${contract.height}"`));
    assert.equal(contract.color, 'sRGB');
  }
});

test('known palettes stay within the authored finite color set', () => {
  const base = createDefaultProject();
  for (const key of Object.keys(PALETTES)) assert.ok(createSvg({ ...base, palette: key }).includes(PALETTES[key].colors[0]));
});
