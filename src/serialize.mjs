import { normalizeProject, SCHEMA_VERSION } from './model.mjs';

export function projectToJson(project) {
  return JSON.stringify({ format: 'cover-foundry-project', schema: SCHEMA_VERSION, project: normalizeProject(project) }, null, 2);
}

export function projectFromJson(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  if (!parsed || parsed.format !== 'cover-foundry-project' || parsed.schema !== SCHEMA_VERSION) throw new Error('This is not a supported Cover Foundry project file.');
  return normalizeProject(parsed.project);
}

export function projectFingerprint(project) {
  return projectToJson(project);
}
