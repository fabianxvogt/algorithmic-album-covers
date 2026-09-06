import { createDefaultProject, normalizeProject, SYSTEMS, PALETTES, FONT_OPTIONS, dimensionsFor, layoutReport, isSupportedFont } from './model.mjs';
import { createSvg, svgBlob } from './generator.mjs';
import { projectToJson, projectFromJson, projectFingerprint } from './serialize.mjs';
import { exportContract, svgToPngBlob } from './export.mjs';

const STORAGE_KEY = 'cover-foundry:v1:project';
const MAX_PROJECT_BYTES = 2 * 1024 * 1024;
let project = createDefaultProject();
let history = [];
let savedFingerprint = null;
let previewUrl = null;
let variationUrls = [];
let noticeTimer = null;
let pendingReplacement = null;

const $ = (id) => document.getElementById(id);
const controls = {
  name: $('project-name'), artist: $('artist'), title: $('title'), subtitle: $('subtitle'), palette: $('palette'), fontFamily: $('font-family'), customFont: $('font-custom'), fontSize: $('font-size'), tracking: $('tracking'), textX: $('text-x'), textY: $('text-y'), seed: $('seed'), preview: $('preview-image'), artboard: $('artboard'), notice: $('notice'), historyButton: $('undo'), savedState: $('saved-state'), dirty: $('dirty-label'), fontState: $('font-state'), fontWarning: $('font-warning'), overflowState: $('overflow-state'), layoutWarning: $('layout-warning'), contract: $('contract'), seedOutput: $('seed-output'), meta: $('preview-meta'), variationGrid: $('variation-grid'), importFile: $('import-file'), saveButton: $('save-project'), loadSaved: $('load-saved'), confirmDialog: $('confirm-dialog'), confirmCancel: $('confirm-cancel'), confirmReplace: $('confirm-replace')
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function slug(value) { return String(value || 'cover-foundry').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'cover-foundry'; }
function download(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function notify(message, type = 'error', duration = 6000) { clearTimeout(noticeTimer); controls.notice.textContent = message; controls.notice.className = `notice active ${type}`; if (duration) noticeTimer = setTimeout(() => { controls.notice.textContent = ''; controls.notice.className = 'notice'; }, duration); }
function currentFont() { return controls.customFont.value.trim() || project.fontFamily; }
function readSavedProjectData() { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } }
function hasSavedProject() { return Boolean(readSavedProjectData()); }

function commit(next, record = true) {
  const normalized = normalizeProject({ ...project, ...next, fontFamily: next.fontFamily ?? project.fontFamily });
  if (projectFingerprint(normalized) === projectFingerprint(project)) return;
  if (record) history.push(clone(project));
  project = normalized;
  render();
}

function applyExternalProject(next, message, markSaved = false) {
  history.push(clone(project));
  project = normalizeProject(next);
  controls.customFont.value = '';
  savedFingerprint = markSaved ? projectFingerprint(project) : null;
  render();
  notify(message, 'success');
}

function requestProjectReplacement(next, message, markSaved = false) {
  pendingReplacement = { next, message, markSaved };
  controls.confirmDialog.classList.remove('hidden');
  controls.confirmReplace.focus();
}

function cancelProjectReplacement() {
  pendingReplacement = null;
  controls.confirmDialog.classList.add('hidden');
}

function confirmProjectReplacement() {
  if (!pendingReplacement) return;
  const replacement = pendingReplacement;
  cancelProjectReplacement();
  applyExternalProject(replacement.next, replacement.message, replacement.markSaved);
}

function handleReplacementKeydown(event) {
  if (event.key === 'Escape' && pendingReplacement) cancelProjectReplacement();
}

function renderSystemTabs() {
  $('system-tabs').innerHTML = SYSTEMS.map((system) => `<button class="system-tab ${project.system === system.id ? 'active' : ''}" data-system="${system.id}"><strong>${system.name}</strong><small>${system.note}</small></button>`).join('');
  document.querySelectorAll('[data-system]').forEach((button) => button.addEventListener('click', () => commit({ system: button.dataset.system })));
}

function renderForm() {
  controls.name.value = project.name; controls.artist.value = project.artist; controls.title.value = project.title; controls.subtitle.value = project.subtitle;
  controls.palette.innerHTML = Object.entries(PALETTES).map(([key, value]) => `<option value="${key}">${value.name}</option>`).join(''); controls.palette.value = project.palette;
  controls.fontFamily.innerHTML = FONT_OPTIONS.map((font) => `<option value="${font}">${font}</option>`).join(''); controls.fontFamily.value = isSupportedFont(project.fontFamily) ? project.fontFamily : 'Arial';
  controls.fontSize.value = project.fontSize; controls.tracking.value = project.tracking; controls.textX.value = project.textX; controls.textY.value = project.textY; controls.seed.value = project.seed; controls.seedOutput.textContent = String(project.seed).padStart(6, '0');
  $('font-size-output').textContent = `${project.fontSize}px`; $('tracking-output').textContent = `${project.tracking}px`; $('text-x-output').textContent = `${project.textX}%`; $('text-y-output').textContent = `${project.textY}%`;
  document.querySelectorAll('[data-align]').forEach((button) => button.classList.toggle('active', button.dataset.align === project.align));
  document.querySelectorAll('[data-variant]').forEach((button) => button.classList.toggle('active', button.dataset.variant === project.variant));
}

function renderStatus() {
  const report = layoutReport(project);
  const contract = exportContract(project);
  controls.contract.textContent = `${contract.width} × ${contract.height} · ${contract.color}`;
  controls.overflowState.textContent = report.overflow ? 'overflow' : 'fits'; controls.overflowState.className = `state-chip ${report.overflow ? 'warn' : 'ok'}`;
  controls.layoutWarning.textContent = report.overflow ? `Estimated ${report.overflowLines.join(', ')} bounds cross the safe area. Reduce scale/tracking or move the copy before export.` : '';
  controls.layoutWarning.classList.toggle('hidden', !report.overflow);
  const customFont = controls.customFont.value.trim();
  const fontReady = !customFont || isSupportedFont(customFont) || (document.fonts?.check?.(`${project.fontSize}px "${customFont}"`) ?? false);
  controls.fontState.textContent = customFont ? (fontReady ? 'font detected' : 'missing font') : 'system font'; controls.fontState.className = `state-chip ${fontReady ? 'ok' : 'warn'}`;
  controls.fontWarning.textContent = fontReady ? '' : `“${customFont}” is not detected on this device. SVG keeps the family name; PNG will use the browser fallback.`; controls.fontWarning.classList.toggle('hidden', fontReady);
  const dirty = !savedFingerprint || projectFingerprint(project) !== savedFingerprint;
  controls.dirty.textContent = dirty ? 'Unsaved changes' : 'Saved locally'; controls.dirty.style.color = dirty ? 'var(--accent-dark)' : '#467243'; controls.savedState.textContent = dirty ? 'Editing' : 'Saved just now'; controls.historyButton.disabled = history.length === 0; controls.loadSaved.disabled = !hasSavedProject();
}

function renderPreview() {
  const svg = createSvg(project);
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(svgBlob(project)); controls.preview.src = previewUrl; controls.preview.alt = `${project.artist} — ${project.title}`; controls.artboard.dataset.variant = project.variant;
  controls.meta.textContent = `${SYSTEMS.find((item) => item.id === project.system).name.toUpperCase()} / ${PALETTES[project.palette].name.toUpperCase()} / ${String(project.seed).padStart(6, '0')}`;
}

function createVariation(index) { return normalizeProject({ ...project, seed: project.seed + (index + 1) * 7919, rotation: project.rotation + (index - 1) * 4, accent: Math.min(1, project.accent + (index - 1) * .12) }); }
function renderVariations() {
  variationUrls.forEach((url) => URL.revokeObjectURL(url)); variationUrls = [];
  controls.variationGrid.innerHTML = '';
  [0, 1, 2].map(createVariation).forEach((variant, index) => { const url = URL.createObjectURL(svgBlob(variant)); variationUrls.push(url); const button = document.createElement('button'); button.className = `variation-card ${variant.seed === project.seed ? 'current' : ''}`; button.innerHTML = `<img src="${url}" alt="Variation ${index + 1}"><span>VAR ${String(index + 1).padStart(2, '0')} / SEED ${String(variant.seed).padStart(6, '0')}</span>`; button.addEventListener('click', () => commit({ seed: variant.seed, rotation: variant.rotation, accent: variant.accent })); controls.variationGrid.appendChild(button); });
}

function render() { renderSystemTabs(); renderForm(); renderStatus(); renderPreview(); renderVariations(); }

function wireTextInput(id, key) { $(id).addEventListener('input', (event) => commit({ [key]: event.target.value })); }
function wireRange(id, key) { $(id).addEventListener('input', (event) => commit({ [key]: Number(event.target.value) })); }

function saveLocal() {
  const data = projectToJson(project);
  try { localStorage.setItem(STORAGE_KEY, data); savedFingerprint = projectFingerprint(project); renderStatus(); notify('Project saved locally. Download the JSON too if you want a portable backup.', 'success', 4500); }
  catch { download(new Blob([data], { type: 'application/json' }), `${slug(project.name)}.cover-foundry.json`); notify('Browser storage is full, so I downloaded a recovery copy instead. Your current artwork is still intact.', 'success', 8000); }
}

function loadLocal() {
  const data = readSavedProjectData(); if (!data) { notify('There is no saved project in this browser yet.'); return; }
  try { requestProjectReplacement(projectFromJson(data), 'Saved project reopened.', true); } catch { notify('The saved project could not be read; your current artwork is untouched.'); }
}

function openImport() { controls.importFile.click(); }
function handleImport(event) {
  const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
  if (file.size > MAX_PROJECT_BYTES) { notify('This project file is larger than 2 MB and was not opened.'); return; }
  if (file.type && file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) { notify('Please choose a Cover Foundry JSON project file.'); return; }
  const reader = new FileReader(); reader.onload = () => { try { const imported = projectFromJson(String(reader.result)); requestProjectReplacement(imported, 'Project imported.'); } catch (error) { notify(`${error.message} Your current artwork is untouched.`); } }; reader.onerror = () => notify('The file could not be read. Your current artwork is untouched.'); reader.readAsText(file);
}

function newProject() {
  const fresh = createDefaultProject(); Object.assign(fresh, { name: 'Untitled release', artist: 'YOUR ARTIST', title: 'YOUR TITLE', subtitle: 'NEW RELEASE', seed: Math.floor(Math.random() * 900000) + 100000 }); requestProjectReplacement(fresh, 'New project ready — make it yours.');
}

async function exportSvg() { const filename = `${slug(project.name)}-${project.variant}.svg`; download(svgBlob(project), filename); notify(`SVG exported at ${dimensionsFor(project.variant).width} × ${dimensionsFor(project.variant).height}.`, 'success', 3500); }
async function exportPng() { try { const blob = await svgToPngBlob(project, createSvg(project)); download(blob, `${slug(project.name)}-${project.variant}.png`); notify(`PNG exported at ${dimensionsFor(project.variant).width} × ${dimensionsFor(project.variant).height} in sRGB.`, 'success', 3500); } catch (error) { notify(error.message); } }

wireTextInput('project-name', 'name'); wireTextInput('artist', 'artist'); wireTextInput('title', 'title'); wireTextInput('subtitle', 'subtitle');
controls.palette.addEventListener('change', (event) => commit({ palette: event.target.value }));
controls.fontFamily.addEventListener('change', (event) => { controls.customFont.value = ''; commit({ fontFamily: event.target.value }); });
controls.customFont.addEventListener('input', (event) => { const value = event.target.value.trim(); commit({ fontFamily: value || controls.fontFamily.value }); });
for (const [id, key] of [['font-size', 'fontSize'], ['tracking', 'tracking'], ['text-x', 'textX'], ['text-y', 'textY'], ['seed', 'seed']]) wireRange(id, key);
document.querySelectorAll('[data-align]').forEach((button) => button.addEventListener('click', () => commit({ align: button.dataset.align })));
document.querySelectorAll('[data-variant]').forEach((button) => button.addEventListener('click', () => commit({ variant: button.dataset.variant })));
$('random-seed').addEventListener('click', () => commit({ seed: Math.floor(Math.random() * 90000000) }));
$('refresh-variations').addEventListener('click', () => { renderVariations(); notify('Fresh nearby variations generated from this recipe.', 'success', 2500); });
controls.historyButton.addEventListener('click', () => { const previous = history.pop(); if (!previous) return; project = normalizeProject(previous); render(); notify('Undid the last edit.', 'success', 2000); });
controls.saveButton.addEventListener('click', saveLocal); controls.loadSaved.addEventListener('click', loadLocal); controls.confirmCancel.addEventListener('click', cancelProjectReplacement); controls.confirmReplace.addEventListener('click', confirmProjectReplacement); $('new-project').addEventListener('click', newProject); $('open-project').addEventListener('click', openImport); $('download-project').addEventListener('click', () => download(new Blob([projectToJson(project)], { type: 'application/json' }), `${slug(project.name)}.cover-foundry.json`)); controls.importFile.addEventListener('change', handleImport); $('export-svg').addEventListener('click', exportSvg); $('export-png').addEventListener('click', exportPng);
document.addEventListener('keydown', handleReplacementKeydown);

window.coverFoundry = { getProject: () => clone(project), getSvg: () => createSvg(project), loadProject: (next) => { project = normalizeProject(next); render(); } };
render();
