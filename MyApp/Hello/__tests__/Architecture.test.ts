import fs from 'fs';
import path from 'path';

// Guards the dependency rule of clean architecture: imports may only point inward.
//   presentation → domain      data → domain      domain → (nothing)
//   Only di/ (the composition root) may know every layer.
const root = path.resolve(__dirname, '..');

const filesIn = (dir: string): string[] =>
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const rel = path.join(dir, entry.name);
    return entry.isDirectory() ? filesIn(rel) : /\.tsx?$/.test(entry.name) ? [rel] : [];
  });

const importsOf = (file: string): string[] => {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  return [...source.matchAll(/from\s+'([^']+)'/g)].map(m => m[1]);
};

const layerOf = (file: string, spec: string): string | null => {
  if (!spec.startsWith('.')) {
    return null;
  }
  const target = path.relative(root, path.resolve(root, path.dirname(file), spec));
  return target.split(path.sep)[0];
};

const forbidden: Record<string, { layers: string[]; packages: RegExp[] }> = {
  domain: { layers: ['data', 'presentation', 'di'], packages: [/^react/, /^@react/] },
  data: { layers: ['presentation', 'di'], packages: [/^react$/, /^react-native$/, /^@react-navigation/] },
  presentation: { layers: ['data', 'di'], packages: [] },
};

describe.each(Object.keys(forbidden))('%s layer', layer => {
  test.each(filesIn(layer).map(f => [f]))('%s respects the dependency rule', file => {
    const rules = forbidden[layer];
    importsOf(file).forEach(spec => {
      expect(rules.layers).not.toContain(layerOf(file, spec));
      rules.packages.forEach(p => expect(spec).not.toMatch(p));
    });
  });
});
